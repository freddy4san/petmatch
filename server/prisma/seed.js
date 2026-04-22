const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";
const DEMO_USERS = [
  {
    id: "user_demo_alex",
    email: "alex.petmatch.demo@example.com",
    fullName: "Alex Rivera",
    phoneNumber: "+15551001001",
  },
  {
    id: "user_demo_priya",
    email: "priya.petmatch.demo@example.com",
    fullName: "Priya Shah",
    phoneNumber: "+15551001002",
  },
  {
    id: "user_demo_jordan",
    email: "jordan.petmatch.demo@example.com",
    fullName: "Jordan Lee",
    phoneNumber: "+15551001003",
  },
  {
    id: "user_demo_taylor",
    email: "taylor.petmatch.demo@example.com",
    fullName: "Taylor Morgan",
    phoneNumber: "+15551001004",
  },
  {
    id: "user_demo_sam",
    email: "sam.petmatch.demo@example.com",
    fullName: "Sam Okafor",
    phoneNumber: "+15551001005",
  },
];

const DEMO_PETS = [
  {
    id: "pet_demo_luna",
    ownerId: "user_demo_alex",
    name: "Luna",
    type: "Dog",
    breed: "Golden Retriever",
    age: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "pet_demo_pepper",
    ownerId: "user_demo_alex",
    name: "Pepper",
    type: "Rabbit",
    breed: "Mini Lop",
    age: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "pet_demo_mochi",
    ownerId: "user_demo_priya",
    name: "Mochi",
    type: "Cat",
    breed: "Ragdoll",
    age: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "pet_demo_scout",
    ownerId: "user_demo_priya",
    name: "Scout",
    type: "Dog",
    breed: "Australian Shepherd",
    age: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "pet_demo_nori",
    ownerId: "user_demo_jordan",
    name: "Nori",
    type: "Cat",
    breed: "British Shorthair",
    age: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "pet_demo_juniper",
    ownerId: "user_demo_taylor",
    name: "Juniper",
    type: "Dog",
    breed: "Whippet",
    age: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "pet_demo_ziggy",
    ownerId: "user_demo_taylor",
    name: "Ziggy",
    type: "Bird",
    breed: "Cockatiel",
    age: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "pet_demo_miso",
    ownerId: "user_demo_sam",
    name: "Miso",
    type: "Cat",
    breed: "Siamese",
    age: 7,
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80",
  },
];

const DEMO_INTERACTIONS = [
  {
    id: "interaction_demo_luna_scout_like",
    fromPetId: "pet_demo_luna",
    toPetId: "pet_demo_scout",
    type: "LIKE",
    createdAt: new Date("2026-04-20T09:10:00.000Z"),
  },
  {
    id: "interaction_demo_scout_luna_like",
    fromPetId: "pet_demo_scout",
    toPetId: "pet_demo_luna",
    type: "LIKE",
    createdAt: new Date("2026-04-20T09:12:00.000Z"),
  },
  {
    id: "interaction_demo_pepper_mochi_like",
    fromPetId: "pet_demo_pepper",
    toPetId: "pet_demo_mochi",
    type: "LIKE",
    createdAt: new Date("2026-04-20T10:04:00.000Z"),
  },
  {
    id: "interaction_demo_mochi_pepper_like",
    fromPetId: "pet_demo_mochi",
    toPetId: "pet_demo_pepper",
    type: "LIKE",
    createdAt: new Date("2026-04-20T10:08:00.000Z"),
  },
  {
    id: "interaction_demo_nori_juniper_like",
    fromPetId: "pet_demo_nori",
    toPetId: "pet_demo_juniper",
    type: "LIKE",
    createdAt: new Date("2026-04-20T11:25:00.000Z"),
  },
  {
    id: "interaction_demo_juniper_nori_like",
    fromPetId: "pet_demo_juniper",
    toPetId: "pet_demo_nori",
    type: "LIKE",
    createdAt: new Date("2026-04-20T11:31:00.000Z"),
  },
  {
    id: "interaction_demo_luna_mochi_pass",
    fromPetId: "pet_demo_luna",
    toPetId: "pet_demo_mochi",
    type: "PASS",
    createdAt: new Date("2026-04-20T12:15:00.000Z"),
  },
  {
    id: "interaction_demo_pepper_scout_pass",
    fromPetId: "pet_demo_pepper",
    toPetId: "pet_demo_scout",
    type: "PASS",
    createdAt: new Date("2026-04-20T12:35:00.000Z"),
  },
  {
    id: "interaction_demo_luna_nori_like",
    fromPetId: "pet_demo_luna",
    toPetId: "pet_demo_nori",
    type: "LIKE",
    createdAt: new Date("2026-04-21T08:02:00.000Z"),
  },
  {
    id: "interaction_demo_ziggy_luna_like",
    fromPetId: "pet_demo_ziggy",
    toPetId: "pet_demo_luna",
    type: "LIKE",
    createdAt: new Date("2026-04-21T08:19:00.000Z"),
  },
  {
    id: "interaction_demo_miso_pepper_like",
    fromPetId: "pet_demo_miso",
    toPetId: "pet_demo_pepper",
    type: "LIKE",
    createdAt: new Date("2026-04-21T08:44:00.000Z"),
  },
];

const MATCHED_PET_PAIRS = [
  ["pet_demo_luna", "pet_demo_scout"],
  ["pet_demo_mochi", "pet_demo_pepper"],
  ["pet_demo_juniper", "pet_demo_nori"],
];

function canonicalPetPair(leftPetId, rightPetId) {
  return [leftPetId, rightPetId].sort();
}

async function resetDemoData(client) {
  const demoPetIds = DEMO_PETS.map((pet) => pet.id);
  const demoUserIds = DEMO_USERS.map((user) => user.id);
  const demoEmails = DEMO_USERS.map((user) => user.email);
  const demoPhoneNumbers = DEMO_USERS.map((user) => user.phoneNumber);
  const conflictingUsers = await client.user.findMany({
    where: {
      id: {
        notIn: demoUserIds,
      },
      OR: [
        { email: { in: demoEmails } },
        { phoneNumber: { in: demoPhoneNumbers } },
      ],
    },
    select: {
      id: true,
      email: true,
      phoneNumber: true,
    },
  });

  if (conflictingUsers.length > 0) {
    throw new Error(
      [
        "Cannot seed PetMatch demo data because existing non-seed users use demo emails or phone numbers.",
        "Remove or rename these accounts before running the seed:",
        ...conflictingUsers.map(
          (user) => `- ${user.id} (${user.email}, ${user.phoneNumber})`
        ),
      ].join("\n")
    );
  }

  await client.match.deleteMany({
    where: {
      OR: [
        { pet1Id: { in: demoPetIds } },
        { pet2Id: { in: demoPetIds } },
      ],
    },
  });
  await client.interaction.deleteMany({
    where: {
      OR: [
        { fromPetId: { in: demoPetIds } },
        { toPetId: { in: demoPetIds } },
      ],
    },
  });
  await client.pet.deleteMany({
    where: {
      id: { in: demoPetIds },
    },
  });
  await client.user.deleteMany({
    where: {
      id: { in: demoUserIds },
    },
  });
}

async function main() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    await resetDemoData(tx);

    await tx.user.createMany({
      data: DEMO_USERS.map((user) => ({
        ...user,
        password,
        createdAt: new Date("2026-04-18T09:00:00.000Z"),
      })),
    });

    await tx.pet.createMany({
      data: DEMO_PETS.map((pet) => ({
        ...pet,
        imagePublicId: null,
        imageAssetId: null,
        imageVersion: null,
        imageFormat: null,
        imageResourceType: null,
        imageBytes: null,
        imageWidth: null,
        imageHeight: null,
        imageOriginalFilename: null,
        imageUploadedAt: null,
      })),
    });

    await tx.interaction.createMany({
      data: DEMO_INTERACTIONS,
    });

    await tx.match.createMany({
      data: MATCHED_PET_PAIRS.map(([leftPetId, rightPetId], index) => {
        const [pet1Id, pet2Id] = canonicalPetPair(leftPetId, rightPetId);
        const createdAt = new Date("2026-04-21T09:00:00.000Z");
        createdAt.setMinutes(createdAt.getMinutes() + index * 37);

        return {
          id: `match_demo_${index + 1}`,
          pet1Id,
          pet2Id,
          createdAt,
        };
      }),
    });
  });

  console.info("Seeded PetMatch demo data:");
  console.info(`- ${DEMO_USERS.length} users`);
  console.info(`- ${DEMO_PETS.length} pets with public image URLs`);
  console.info(`- ${DEMO_INTERACTIONS.length} swipes/interactions`);
  console.info(`- ${MATCHED_PET_PAIRS.length} matches`);
  console.info("- Messages skipped: schema.prisma does not define a Message model yet");
  console.info(`Demo login: ${DEMO_USERS[0].email} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
