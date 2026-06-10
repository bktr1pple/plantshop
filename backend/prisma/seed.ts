import type { Prisma } from '../src/generated/prisma/client';
import { createPrismaClient } from '../src/prisma/create-prisma-client';
import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(__dirname, '..', '.env') });

type SeedPlant = {
  name: string;
  description: string;
  price: number;
  imageUrls: [string, string];
};

const prisma = createPrismaClient();

function toPlantData(plant: SeedPlant): Prisma.PlantCreateManyInput {
  return {
    name: plant.name,
    description: plant.description,
    price: plant.price,
    images: JSON.stringify(plant.imageUrls),
  };
}

const plants: SeedPlant[] = [
  {
    name: 'Монстера Деліціоза',
    description:
      'Велика кімнатна рослина з виразним різьбленим листям для просторих віталень, офісів і зимових садів.',
    price: 780,
    imageUrls: [
      '/images/seed-plants/monstera-deliciosa-1.jpg',
      '/images/seed-plants/monstera-deliciosa-2.jpg',
    ],
  },
  {
    name: 'Фікус Лірата',
    description:
      'Декоративний фікус із великим листям скрипкоподібної форми. Добре підходить для сучасних інтер’єрів.',
    price: 920,
    imageUrls: [
      '/images/seed-plants/ficus-lyrata-1.jpg',
      '/images/seed-plants/ficus-lyrata-2.jpg',
    ],
  },
  {
    name: 'Сансевієрія Лауренті',
    description:
      'Невибаглива рослина з вертикальним листям, яка витримує нерегулярний полив і підходить для початківців.',
    price: 420,
    imageUrls: [
      '/images/seed-plants/sansevieria-laurentii-1.jpg',
      '/images/seed-plants/sansevieria-laurentii-2.jpg',
    ],
  },
  {
    name: 'Заміокулькас Замієлистий',
    description:
      'Стійка кімнатна рослина з глянцевим темно-зеленим листям для дому, рецепції або робочого кабінету.',
    price: 560,
    imageUrls: [
      '/images/seed-plants/zamioculcas-zamiifolia-1.jpg',
      '/images/seed-plants/zamioculcas-zamiifolia-2.jpg',
    ],
  },
  {
    name: 'Спатифілум Сенсація',
    description:
      'Квітуча кімнатна рослина з білими суцвіттями та насиченим зеленим листям. Доречна для затишних інтер’єрів.',
    price: 510,
    imageUrls: [
      '/images/seed-plants/spathiphyllum-sensation-1.jpg',
      '/images/seed-plants/spathiphyllum-sensation-2.jpg',
    ],
  },
  {
    name: 'Пілея Пеперомієподібна',
    description:
      'Компактна рослина з округлим листям для полиць, робочих столів і невеликих квартирних композицій.',
    price: 310,
    imageUrls: [
      '/images/seed-plants/pilea-peperomioides-2.jpg',
      '/images/seed-plants/pilea-peperomioides-2.jpg',
    ],
  },
  {
    name: 'Калатея Орбіфолія',
    description:
      'Ефектна декоративно-листяна рослина зі смугастим листям, яка потребує стабільної вологості та розсіяного світла.',
    price: 640,
    imageUrls: [
      '/images/seed-plants/calathea-orbifolia-1.jpg',
      '/images/seed-plants/calathea-orbifolia-2.jpg',
    ],
  },
  {
    name: 'Філодендрон Біркін',
    description:
      'Сорт філодендрона з контрастними світлими прожилками на листі. Добре виглядає як акцентна кімнатна рослина.',
    price: 690,
    imageUrls: [
      '/images/seed-plants/philodendron-birkin-1.jpg',
      '/images/seed-plants/philodendron-birkin-2.jpg',
    ],
  },
  {
    name: 'Епіпремнум Золотистий',
    description:
      'Ампельна рослина з виткими пагонами для підвісних кашпо, полиць і зелених стін у приміщеннях.',
    price: 290,
    imageUrls: [
      '/images/seed-plants/epipremnum-aureum-2.jpg',
      '/images/seed-plants/epipremnum-aureum-2.jpg',
    ],
  },
  {
    name: 'Антуріум Андре',
    description:
      'Квітуча рослина з яскравими приквітками, яка додає інтер’єру кольору та добре підходить для подарунку.',
    price: 730,
    imageUrls: [
      '/images/seed-plants/anthurium-andre-2.jpg',
      '/images/seed-plants/anthurium-andre-2.jpg',
    ],
  },
  {
    name: 'Орхідея Фаленопсис',
    description:
      'Популярна квітуча орхідея для дому. Потребує світлого місця без прямого сонця та помірного поливу.',
    price: 590,
    imageUrls: [
      '/images/seed-plants/phalaenopsis-orchid-2.jpg',
      '/images/seed-plants/phalaenopsis-orchid-2.jpg',
    ],
  },
  {
    name: 'Алое Вера',
    description:
      'Сукулент із м’ясистим листям, який добре переносить сухе повітря та сонячні підвіконня.',
    price: 260,
    imageUrls: [
      '/images/seed-plants/aloe-vera-1.jpg',
      '/images/seed-plants/aloe-vera-1.jpg',
    ],
  },
  {
    name: 'Ехеверія Розеткова',
    description:
      'Компактний сукулент із симетричною розеткою листя для мінімалістичних композицій і невеликих кашпо.',
    price: 230,
    imageUrls: [
      '/images/seed-plants/echeveria-rosette-1.jpg',
      '/images/seed-plants/echeveria-rosette-1.jpg',
    ],
  },
  {
    name: 'Красула Овата',
    description:
      'Грошове дерево з щільним зеленим листям. Невибагливий варіант для дому або офісного столу.',
    price: 340,
    imageUrls: [
      '/images/seed-plants/crassula-ovata-1.jpg',
      '/images/seed-plants/crassula-ovata-1.jpg',
    ],
  },
  {
    name: 'Драцена Маргіната',
    description:
      'Вертикальна декоративна рослина з вузьким листям, яка добре підходить для зонування простору.',
    price: 720,
    imageUrls: [
      '/images/seed-plants/dracaena-marginata-1.jpg',
      '/images/seed-plants/dracaena-marginata-1.jpg',
    ],
  },
  {
    name: 'Пальма Арека',
    description:
      'Об’ємна пальма з м’яким перистим листям для світлих кімнат, холів і офісних просторів.',
    price: 1180,
    imageUrls: [
      '/images/seed-plants/areca-palm-1.jpg',
      '/images/seed-plants/areca-palm-1.jpg',
    ],
  },
  {
    name: 'Хамедорея Елеганс',
    description:
      'Компактна кімнатна пальма, яка додає інтер’єру легкості та добре росте при розсіяному освітленні.',
    price: 680,
    imageUrls: [
      '/images/seed-plants/chamaedorea-elegans-1.jpg',
      '/images/seed-plants/chamaedorea-elegans-2.jpg',
    ],
  },
  {
    name: 'Юка Слонова',
    description:
      'Структурна рослина з міцним стовбуром і жорстким листям для сучасних інтер’єрів і просторих приміщень.',
    price: 980,
    imageUrls: [
      '/images/seed-plants/yucca-elephantipes-2.jpg',
      '/images/seed-plants/yucca-elephantipes-2.jpg',
    ],
  },
  {
    name: 'Лаванда Вузьколиста',
    description:
      'Ароматна садова рослина для контейнерів, терас і ландшафтних композицій у сонячних місцях.',
    price: 190,
    imageUrls: [
      '/images/seed-plants/lavender-angustifolia-1.jpg',
      '/images/seed-plants/lavender-angustifolia-1.jpg',
    ],
  },
  {
    name: 'Туя Смарагд',
    description:
      'Вічнозелена хвойна рослина для живоплотів, вхідних груп і декоративного озеленення ділянок.',
    price: 450,
    imageUrls: [
      '/images/seed-plants/thuja-smaragd-1.jpg',
      '/images/seed-plants/thuja-smaragd-1.jpg',
    ],
  },
  {
    name: 'Гортензія Метельчаста',
    description:
      'Квітучий кущ для саду з великими суцвіттями, який добре підходить для акцентних ландшафтних зон.',
    price: 520,
    imageUrls: [
      '/images/seed-plants/hydrangea-paniculata-1.jpg',
      '/images/seed-plants/hydrangea-paniculata-1.jpg',
    ],
  },
  {
    name: 'Самшит Вічнозелений',
    description:
      'Кущ для бордюрів, геометричних форм і регулярного саду. Підходить для контейнерного вирощування.',
    price: 360,
    imageUrls: [
      '/images/seed-plants/boxwood-evergreen-1.jpg',
      '/images/seed-plants/boxwood-evergreen-1.jpg',
    ],
  },
  {
    name: 'Троянда Паркова',
    description:
      'Садова троянда для квітників і прибудинкових ділянок. Формує виразний декоративний акцент у сезон цвітіння.',
    price: 410,
    imageUrls: [
      '/images/seed-plants/park-rose-1.jpg',
      '/images/seed-plants/park-rose-2.jpg',
    ],
  },
  {
    name: 'Нефролепіс Бостон',
    description:
      'Пишна папороть для підвісних кашпо та вологих світлих приміщень без прямого сонячного проміння.',
    price: 390,
    imageUrls: [
      '/images/seed-plants/boston-fern-1.jpg',
      '/images/seed-plants/boston-fern-2.jpg',
    ],
  },
];

async function seedPlants() {
  const seedNames = plants.map((plant) => plant.name);

  const result = await prisma.$transaction(async (tx) => {
    const existingPlants = await tx.plant.findMany({
      where: {
        name: { in: seedNames },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    const idsByName = new Map<string, number[]>();
    for (const plant of existingPlants) {
      idsByName.set(plant.name, [...(idsByName.get(plant.name) ?? []), plant.id]);
    }

    let created = 0;
    let updated = 0;
    let removedDuplicates = 0;

    for (const plant of plants) {
      const data = toPlantData(plant);
      const existingIds = idsByName.get(plant.name) ?? [];
      const primaryId = existingIds[0];

      if (primaryId) {
        await tx.plant.update({
          where: { id: primaryId },
          data,
        });
        updated += 1;
      } else {
        await tx.plant.create({ data });
        created += 1;
      }

      const duplicateIds = existingIds.slice(1);
      if (duplicateIds.length > 0) {
        await tx.plant.deleteMany({
          where: {
            id: { in: duplicateIds },
          },
        });
        removedDuplicates += duplicateIds.length;
      }
    }

    return { created, updated, removedDuplicates };
  });

  console.log(
    `Seed Plant завершено: створено ${result.created}, оновлено ${result.updated}, видалено дублікатів ${result.removedDuplicates}.`,
  );
}

seedPlants()
  .catch((error) => {
    console.error('Не вдалося виконати seed Plant:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
