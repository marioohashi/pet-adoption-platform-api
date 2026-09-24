import { PrismaClient } from "@prisma/client";
const { faker } = require("@faker-js/faker");
const prisma = new PrismaClient();

async function main() {
  // Criar 10 usuários
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password(),
        phone: faker.phone.number(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        city: faker.location.city(),
        state: faker.location.state(),
      },
    });
    users.push(user);
  }

  // Criar 50 animais
  const speciesOptions = ["cat", "dog"] as const;
  const sexOptions = ["male", "female"];

  for (let i = 0; i < 50; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomSpecies = speciesOptions[Math.floor(Math.random() * speciesOptions.length)];

    await prisma.animal.create({
      data: {
        name: faker.person.firstName(),
        species: randomSpecies,
        breed: faker.animal.dog(), // mesmo para gatos, fica engraçado mas você pode ajustar
        age: faker.number.int({ min: 1, max: 15 }),
        size: faker.helpers.arrayElement(["small", "medium", "large"]),
        sex: faker.helpers.arrayElement(sexOptions),
        description: faker.lorem.paragraph(),
        status: "available",
        photo: faker.image.urlLoremFlickr({ category: randomSpecies }),
        userId: randomUser.id,
      },
    });
  }

  console.log("Seed finalizado com sucesso!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
