import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer des utilisateurs de test
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Entrepreneur
  const entrepreneur = await prisma.user.upsert({
    where: { email: 'entrepreneur@example.com' },
    update: {},
    create: {
      email: 'entrepreneur@example.com',
      name: 'Jean Kouassi',
      password: hashedPassword,
      role: 'entrepreneur',
      country: 'Côte d\'Ivoire',
      city: 'Abidjan',
      bio: 'Entrepreneur passionné par la tech',
      entrepreneurProfile: {
        create: {
          companyName: 'TechStart CI',
          industry: 'Technologie',
          stage: 'mvp',
          description: 'Startup spécialisée dans les solutions fintech',
        },
      },
    },
  })

  // Mentor
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@example.com' },
    update: {},
    create: {
      email: 'mentor@example.com',
      name: 'Marie Diallo',
      password: hashedPassword,
      role: 'mentor',
      country: 'Sénégal',
      city: 'Dakar',
      bio: 'Mentor expérimentée en stratégie business',
      mentorProfile: {
        create: {
          expertise: ['Stratégie', 'Marketing', 'Finance'],
          experience: 15,
          availability: 'part-time',
          rate: 'paid',
          description: '15 ans d\'expérience dans l\'accompagnement de startups',
        },
      },
    },
  })

  // Investisseur
  const investor = await prisma.user.upsert({
    where: { email: 'investor@example.com' },
    update: {},
    create: {
      email: 'investor@example.com',
      name: 'Amadou Traoré',
      password: hashedPassword,
      role: 'investor',
      country: 'Mali',
      city: 'Bamako',
      bio: 'Business Angel spécialisé dans la tech africaine',
      investorProfile: {
        create: {
          type: 'angel',
          focusAreas: ['Fintech', 'E-commerce', 'EdTech'],
          ticketSize: '10K - 50K USD',
          stage: ['ideation', 'mvp'],
          description: 'Investisseur expérimenté dans l\'écosystème tech africain',
        },
      },
    },
  })

  // Talent
  const talent = await prisma.user.upsert({
    where: { email: 'talent@example.com' },
    update: {},
    create: {
      email: 'talent@example.com',
      name: 'Fatou Sarr',
      password: hashedPassword,
      role: 'talent',
      country: 'Sénégal',
      city: 'Dakar',
      bio: 'Développeuse full-stack expérimentée',
      talentProfile: {
        create: {
          skills: ['React', 'Node.js', 'TypeScript', 'Python'],
          experience: 5,
          availability: 'freelance',
          rate: '50-80 USD/heure',
          description: 'Développeuse full-stack avec 5 ans d\'expérience',
        },
      },
    },
  })

  // Outils
  const tools = [
    {
      name: 'Stripe',
      category: 'finance',
      description: 'Solution de paiement en ligne pour les startups',
      url: 'https://stripe.com',
      pricing: 'paid',
      tags: ['paiement', 'fintech', 'API'],
      createdBy: entrepreneur.id,
    },
    {
      name: 'Notion',
      category: 'productivity',
      description: 'Outil de gestion de projet et documentation',
      url: 'https://notion.so',
      pricing: 'freemium',
      tags: ['productivité', 'documentation', 'gestion'],
      createdBy: entrepreneur.id,
    },
    {
      name: 'Figma',
      category: 'design',
      description: 'Outil de design collaboratif',
      url: 'https://figma.com',
      pricing: 'freemium',
      tags: ['design', 'UI/UX', 'collaboration'],
      createdBy: entrepreneur.id,
    },
  ]

  for (const tool of tools) {
    await prisma.tool.create({
      data: tool,
    }).catch(() => {
      // Ignore si l'outil existe déjà
    })
  }

  // Programmes
  const programs = [
    {
      name: 'Techstars Startup Weekend',
      type: 'accelerator',
      description: 'Programme d\'accélération de 3 mois pour les startups tech',
      duration: '3 mois',
      cost: 'equity',
      tags: ['accélération', 'tech', 'mentorat'],
      country: 'Côte d\'Ivoire',
      city: 'Abidjan',
      createdBy: entrepreneur.id,
    },
    {
      name: 'Y Combinator Startup School',
      type: 'training',
      description: 'Formation en ligne gratuite pour entrepreneurs',
      duration: '10 semaines',
      cost: 'free',
      url: 'https://www.startupschool.org',
      tags: ['formation', 'en ligne', 'gratuit'],
      createdBy: entrepreneur.id,
    },
  ]

  for (const program of programs) {
    await prisma.program.create({
      data: program,
    }).catch(() => {
      // Ignore si le programme existe déjà
    })
  }

  console.log('✅ Seeding terminé!')
  console.log('\nComptes de test créés:')
  console.log('- entrepreneur@example.com / password123')
  console.log('- mentor@example.com / password123')
  console.log('- investor@example.com / password123')
  console.log('- talent@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

