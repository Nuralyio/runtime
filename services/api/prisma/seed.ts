import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// This is the fixed user ID from Keycloak dev user that matches nuraly-realm.json
const KEYCLOAK_DEV_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

async function main() {
  console.log('Starting database seed from backup...');

  // Create the dev user that matches Keycloak import
  const hashedPassword = await bcrypt.hash('dev123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'dev@nuraly.io' },
    update: {
      id: KEYCLOAK_DEV_USER_ID,
      name: 'Dev User',
      password: hashedPassword,
    },
    create: {
      id: KEYCLOAK_DEV_USER_ID,
      email: 'dev@nuraly.io',
      name: 'Dev User',
      password: hashedPassword,
    },
  });

  console.log('Created/Updated dev user:', user);

  // Seed applications from backup
  const applications = [
    { id: 1, name: 'aaaa', published: false, uuid: '52eb1876-d5ac-48fd-a2c4-658fecb36e22', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 2, name: 'Nuraly Home Page', published: false, uuid: '862d84a4-0be4-4cd0-8255-77f270094ff8', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 3, name: 'Test-app', published: false, uuid: '9430db5d-9789-4d63-be02-740378e3aba0', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 4, name: 'rag', published: false, uuid: '491b86f3-aa54-4c49-a584-24b96ec82c06', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 5, name: 'dashboard', published: false, uuid: 'e5ea6ef3-f467-402c-bacf-199d68bdc63d', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 6, name: 'new app two', published: false, uuid: 'ea233575-39c5-436e-8816-ace0f689fed4', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 10, name: 'sharp-goose-8367', published: false, uuid: '2e6cbbc8-59f5-445d-b8bb-542020b78dab', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 11, name: 'sharp-owl-5620', published: false, uuid: '55ad68aa-7e8b-426b-b9da-9bc256e7264f', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 12, name: 'fiery-hawk-3043', published: false, uuid: '6553cbc0-92dc-4eb6-b827-882884e9303b', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 13, name: 'sharp-goose-1829', published: false, uuid: '25545838-e001-4bad-932f-391eb9526e5f', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 14, name: 'silent-giraffe-6155', published: false, uuid: 'efcc0168-3ba9-4152-ab22-92ee22e7d13d', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 15, name: 'radiant-goose-1595', published: false, uuid: '57b1baad-7a38-4732-91d5-fce6f4621480', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 16, name: 'Nuraly Documentation V2', published: false, uuid: '838669d8-92d2-4342-baba-5f32a40eef42', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 17, name: 'nuraly-blog', published: false, uuid: 'b6c03b4a-06b5-41a8-a47a-2f9284fc9e6e', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 18, name: 'studio-function', published: false, uuid: '31fe81f2-10ed-4ea2-b092-7ba3b39aae87', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 19, name: 'graceful-owl-6385', published: false, uuid: '15c09429-60f0-4240-92be-2745ba27b60f', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 20, name: 'employees manager', published: false, uuid: '9632da77-caf2-42db-bce7-5248c5b13513', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 21, name: 'presentation', published: false, uuid: 'bbaa871c-ec19-4826-888e-5b6b258044fe', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 24, name: 'agile-crocodile-7612', published: false, uuid: '88089042-1725-4ed4-b48c-25001c4dd71d', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 25, name: 'steady-gorilla-9727', published: false, uuid: '85dfbb91-5dcf-4010-99e5-20255029b403', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 26, name: 'radiant-coyote-2380', published: false, uuid: '544d318f-25bc-44a2-9cfd-264946fc22c8', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 27, name: 'serene-octopus-3420', published: false, uuid: 'a6bcae0b-a78d-44c1-a023-a3c0770206c8', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
    { id: 28, name: 'file-storage', published: false, uuid: 'e58edd43-385c-4900-b322-dbfdd4f1dc77', user_id: KEYCLOAK_DEV_USER_ID, default_page_uuid: null },
  ];

  console.log('Seeding applications...');
  for (const app of applications) {
    await prisma.applications.upsert({
      where: { uuid: app.uuid },
      update: { ...app },
      create: app,
    });
  }
  console.log(`Seeded ${applications.length} applications`);

  // Note: Components and pages data is extensive in the backup
  // For now, we'll create ownership and permission records for all applications
  console.log('Creating ownership and permission records...');
  
  let ownershipId = 1;
  let permissionId = 1;

  for (const app of applications) {
    // Create ownership
    await prisma.ownership.upsert({
      where: { id: ownershipId },
      update: {},
      create: {
        id: ownershipId,
        ownerId: KEYCLOAK_DEV_USER_ID,
        resourceId: app.uuid,
        resourceType: 'application',
      },
    });

    // Create permission
    await prisma.permission.upsert({
      where: { id: permissionId },
      update: {},
      create: {
        id: permissionId,
        userId: KEYCLOAK_DEV_USER_ID,
        resourceId: app.uuid,
        resourceType: 'application',
        publicState: false,
        permissionType: 'owner',
        ownerId: KEYCLOAK_DEV_USER_ID,
        allowed: {
          read: true,
          write: true,
          delete: true,
          share: true,
        },
      },
    });

    ownershipId++;
    permissionId++;
  }

  console.log('Created ownership and permission records for all applications');

  // Seed a few sample components from the backup
  const sampleComponents = [
    {
      id: 1,
      uuid: '590f7ead-6ad5-4df0-9d09-df6e7230353a',
      user_id: KEYCLOAK_DEV_USER_ID,
      application_id: '52eb1876-d5ac-48fd-a2c4-658fecb36e22',
      component: {
        name: 'text_label_2775',
        root: true,
        uuid: '590f7ead-6ad5-4df0-9d09-df6e7230353a',
        input: { data: { type: 'handler', value: '' }, value: { type: 'value', value: 'Text label' } },
        style: { fontSize: '25px', 'box-shadow': ' 0px 0px 0px 0px #000000 ', 'font-family': 'tahoma', 'border-radius': '0px', 'text-decoration': 'none' },
        pageId: '98cd05d6-ecc5-4d98-9ef9-2f1b2fbbe1d5',
        values: { value: 'Text label' },
        applicationId: '52eb1876-d5ac-48fd-a2c4-658fecb36e22',
        application_id: '52eb1876-d5ac-48fd-a2c4-658fecb36e22',
        component_type: 'text_label',
      },
    },
  ];

  console.log('Seeding sample components...');
  for (const comp of sampleComponents) {
    await prisma.components.upsert({
      where: { uuid: comp.uuid },
      update: { ...comp },
      create: comp,
    });
  }
  console.log('Seeded sample components');

  console.log('Database seeding from backup completed successfully!');
  console.log('All data is now associated with dev@nuraly.io user (ID: ' + KEYCLOAK_DEV_USER_ID + ')');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
