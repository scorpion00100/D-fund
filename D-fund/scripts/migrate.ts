import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { PrismaClient, ApplicationStage, OpportunityStatus } from '@prisma/client';

/**
 * Script de migration depuis les CSV Glide vers la base Supabase/PostgreSQL via Prisma.
 *
 * Principes:
 * - On réutilise les Row ID Glide comme `id` Prisma quand c'est pertinent
 *   (User.id, Opportunity.id, Application.id, etc.) pour garder la cohérence des FK.
 * - On commence par migrer les entités cœur V1:
 *   - Users(1).csv  -> User, BtoCProfile, BtoBProfile
 *   - Opportunities(1).csv -> Opportunity
 *   - Applications(1).csv  -> Application
 * - Les autres CSV (messages, discussions, tasks, ratings, referrals...) pourront être ajoutés ensuite.
 *
 * Utilisation:
 *   npx ts-node scripts/migrate.ts
 *
 * ATTENTION:
 * - À lancer uniquement sur une base vide ou de test.
 * - Vérifier que DATABASE_URL pointe bien vers votre instance Supabase cible.
 */

const prisma = new PrismaClient();

const ROOT_DIR = path.resolve(__dirname, '..');
const CSV_DIR = path.join(ROOT_DIR, 'data', 'glide', 'raw');

function readCsv(fileName: string) {
  const filePath = path.join(CSV_DIR, fileName);
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];
}

async function migrateUsers() {
  const rows = readCsv('Users(1).csv');

  for (const row of rows) {
    const rowId = row['🔒 Row ID'] || row['Row ID'];
    const email = row['Resume / Email']?.trim();
    if (!email) continue;

    // User de base
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: rowId || undefined,
        email,
        firstName: row['Resume / First Name'] || null,
        lastName: row['Resume / Last Name'] || null,
        profilePic: row['Resume / Profile Pic'] || null,
        headerImage: row['BtoC Info / Header'] || null,
        city: row['Resume / City'] || null,
        country: row['Resume / Country'] || null,
        linkedinUrl: row['Resume / Linkedin Url'] || null,
        // On laisse password null, ce seront des comptes importés (login à gérer plus tard)
      },
    });

    // Profil BtoC si données présentes
    const hasBtoC =
      row['Profile / Bio'] ||
      row['Profile / Tags Displayed'] ||
      row['Profile / Industries'] ||
      row['Profile / Market Focus'];

    if (hasBtoC) {
      await prisma.btoCProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          description: row['Profile / Bio'] || null,
          tags: row['Profile / Tags Displayed'] ? row['Profile / Tags Displayed'].split(',').map((t) => t.trim()) : [],
          industries: row['Profile / Industries']
            ? row['Profile / Industries'].split(',').map((t) => t.trim())
            : [],
          marketFocus: row['Profile / Market Focus']
            ? row['Profile / Market Focus'].split(',').map((t) => t.trim())
            : [],
          languages: row['Profile / Languages']
            ? row['Profile / Languages'].split(',').map((t) => t.trim())
            : [],
          businessSkills: row['Profile / Business Skills']
            ? row['Profile / Business Skills'].split(',').map((t) => t.trim())
            : [],
          techSkills: row['Profile / Tech Skills']
            ? row['Profile / Tech Skills'].split(',').map((t) => t.trim())
            : [],
          seniorityLevel: row['Profile / Seniority Level'] || null,
        },
      });
    }

    // Profil BtoB si données présentes
    const hasBtoB =
      row['Profile / Company Name'] ||
      row['Profile / Long Description'] ||
      row['Profile / Development Stage'];

    if (hasBtoB) {
      await prisma.btoBProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          companyName: row['Profile / Company Name'] || email,
          logo: row['Visuals & Documents / Logo'] || null,
          punchline: row['Profile / Punchline'] || null,
          description: row['Profile / Long Description'] || null,
          longDescription: row['Profile / Long Description'] || null,
          website: row['Profile / Website'] || null,
          linkedinUrl: row['Profile / LinkedIn'] || null,
          developmentStage: row['Profile / Development Stage'] || null,
          industries: row['Profile / Industries']
            ? row['Profile / Industries'].split(',').map((t) => t.trim())
            : [],
          marketFocus: row['Profile / Market Focus']
            ? row['Profile / Market Focus'].split(',').map((t) => t.trim())
            : [],
        },
      });
    }
  }
}

function mapOpportunityStatus(status?: string): OpportunityStatus {
  if (!status) return OpportunityStatus.DRAFT;
  const s = status.toLowerCase();
  if (s.includes('active') || s.includes('published')) return OpportunityStatus.ACTIVE;
  if (s.includes('draft')) return OpportunityStatus.DRAFT;
  if (s.includes('archiv')) return OpportunityStatus.ARCHIVED;
  if (s.includes('closed')) return OpportunityStatus.CLOSED;
  return OpportunityStatus.DRAFT;
}

async function migrateOpportunities() {
  const rows = readCsv('Opportunities(1).csv');

  for (const row of rows) {
    const rowId = row['🔒 Row ID'] || row['Row ID'];
    const name = row['Offer / Opportunity Name'] || row['Name'];
    if (!name) continue;

    const ownerEmail = row['Foreign Keys / BtoC Owner Email']?.trim();
    if (!ownerEmail) continue;

    const owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (!owner) {
      console.warn(`Owner not found for opportunity ${name} (${ownerEmail})`);
      continue;
    }

    await prisma.opportunity.upsert({
      where: { id: rowId || name },
      update: {},
      create: {
        id: rowId || undefined,
        name,
        punchline: row['Offer / Punchline'] || null,
        description: row['Offer / Description'] || null,
        // type sera affiné plus tard via Feature.mapping si besoin
        type: 'JOB_OPPORTUNITY',
        ownerId: owner.id,
        status: mapOpportunityStatus(row['Offer / Publication Status']),
        url: row['Offer / Url'] || null,
        tags: row['Offer / Tags']
          ? row['Offer / Tags'].split(',').map((t) => t.trim())
          : [],
        industries: row['Offer / Industries']
          ? row['Offer / Industries'].split(',').map((t) => t.trim())
          : [],
        markets: row['Offer / Markets']
          ? row['Offer / Markets'].split(',').map((t) => t.trim())
          : [],
      },
    });
  }
}

function mapApplicationStage(stage?: string): ApplicationStage {
  if (!stage) return ApplicationStage.DRAFT;
  const s = stage.toLowerCase();
  if (s.includes('draft')) return ApplicationStage.DRAFT;
  if (s.includes('submitted')) return ApplicationStage.SUBMITTED;
  if (s.includes('review')) return ApplicationStage.OWNER_REVIEW;
  if (s.includes('success') || s.includes('accepted')) return ApplicationStage.SUCCESS;
  if (s.includes('archive')) return ApplicationStage.ARCHIVED;
  return ApplicationStage.DRAFT;
}

async function migrateApplications() {
  const rows = readCsv('Applications(1).csv');

  for (const row of rows) {
    const rowId = row['🔒 Row ID'] || row['Row ID'];
    const opportunityId = row['Foreign Keys / Opportunity ID'];
    const candidateEmail = row['Foreign Keys / email BtoC Candidate']?.trim();
    if (!opportunityId || !candidateEmail) continue;

    const candidate = await prisma.user.findUnique({ where: { email: candidateEmail } });
    if (!candidate) {
      console.warn(`Candidate not found for application ${rowId} (${candidateEmail})`);
      continue;
    }

    const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opportunity) {
      console.warn(`Opportunity not found for application ${rowId} (${opportunityId})`);
      continue;
    }

    await prisma.application.upsert({
      where: {
        opportunityId_candidateId: {
          opportunityId: opportunity.id,
          candidateId: candidate.id,
        },
      },
      update: {},
      create: {
        id: rowId || undefined,
        opportunityId: opportunity.id,
        candidateId: candidate.id,
        title: row['Application / Title'] || null,
        goalLetter: row['Application / Goal Letter'] || null,
        stage: mapApplicationStage(row['Application Stage / Stage']),
        isClosed: (row['Application Stage / Is Closed?'] || '').toLowerCase() === 'true',
        isDraft: (row['Navigation / Draft Slider'] || '').toLowerCase() === 'true',
        reviewFeedback: row['Owner Review / Review'] || null,
        referralCodeUsed: row['Referrals / Code Used'] || null,
      },
    });
  }
}

async function main() {
  console.log('Starting Glide → Supabase migration (core V1 entities)...');

  await migrateUsers();
  console.log('Users migrated');

  await migrateOpportunities();
  console.log('Opportunities migrated');

  await migrateApplications();
  console.log('Applications migrated');

  console.log('Migration core V1 completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


