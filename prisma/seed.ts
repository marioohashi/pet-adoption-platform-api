import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { fakerPT_BR as faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // Criar 10 usuários
  const users = [];
  for (let i = 0; i < 10; i++) {
    const passwordHash = await bcrypt.hash("123456", 10);

    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: passwordHash,
        phone: faker.phone.number(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        city: faker.location.city(),
        state: faker.location.state(),
      },
    });

    users.push(user);
  }

  console.log("👤 Usuários criados:", users.length);

  if (users.length === 0) {
    throw new Error("Nenhum usuário foi criado no seed.");
  }

  function pickRandom<T>(arr: T[]): T {
    if (arr.length === 0) {
      throw new Error("Array vazio passado para pickRandom()");
    }
    return arr[Math.floor(Math.random() * arr.length)]!;
  }
  console.log("🐶 Criando pets...");
  // Criar 50 animais
  const speciesList = ["dog", "cat", "rabbit", "bird"];
  const sizeList = ["small", "medium", "large"];
  const sexList = ["male", "female"];

  for (let i = 0; i < 50; i++) {
    const randomUser = pickRandom(users);

    await prisma.animal.create({
      data: {
        name: faker.person.firstName(),
        species: faker.helpers.arrayElement(speciesList),
        breed: faker.animal.dog(), // funciona para dog, mas ok para exemplo
        age: faker.number.int({ min: 1, max: 15 }),
        size: faker.helpers.arrayElement(sizeList),
        sex: faker.helpers.arrayElement(sexList),
        description: faker.lorem.paragraph(),
        photo: faker.image.urlPicsumPhotos(),
        userId: randomUser.id,
      },
    });
  }

  console.log("🐶 Pets criados: 50");
}

main()
  .then(() => {
    console.log("🌳 Seed finalizado!");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });