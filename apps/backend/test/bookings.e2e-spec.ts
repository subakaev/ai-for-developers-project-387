import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ApiExceptionFilter } from '../src/common/api-exception.filter';
import type { Slot } from '../src/api/types';

describe('Bookings & event types (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => app.getHttpServer();

  it('serves the seeded event types', async () => {
    const res = await request(server()).get('/event-types').expect(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.map((e: { id: string }) => e.id)).toContain('intro-call');
  });

  it('returns 404 with an ApiError for an unknown event type', async () => {
    const res = await request(server()).get('/event-types/nope').expect(404);
    expect(res.body).toEqual({
      code: 'event_type_not_found',
      message: expect.any(String),
    });
  });

  it('books a free slot (201) and rejects the same slot (409)', async () => {
    const slotsRes = await request(server())
      .get('/event-types/intro-call/slots')
      .expect(200);
    const slot = (slotsRes.body as Slot[]).find((s) => s.available);
    expect(slot).toBeDefined();

    const payload = {
      eventTypeId: 'intro-call',
      guestName: 'Ada Lovelace',
      guestEmail: 'ada@example.com',
      start: slot!.start,
    };

    const created = await request(server())
      .post('/bookings')
      .send(payload)
      .expect(201);
    expect(created.body).toMatchObject({
      eventTypeId: 'intro-call',
      start: slot!.start,
      end: slot!.end,
    });
    expect(created.body.id).toEqual(expect.any(String));

    const conflict = await request(server())
      .post('/bookings')
      .send(payload)
      .expect(409);
    expect(conflict.body.code).toBe('slot_taken');

    // The booked slot is no longer offered as available.
    const after = await request(server())
      .get('/event-types/intro-call/slots')
      .expect(200);
    const sameSlot = (after.body as Slot[]).find(
      (s) => s.start === slot!.start,
    );
    expect(sameSlot?.available).toBe(false);

    // And it shows up in the owner's bookings list.
    const bookings = await request(server()).get('/bookings').expect(200);
    expect(
      bookings.body.some((b: { start: string }) => b.start === slot!.start),
    ).toBe(true);
  });

  it('rejects an invalid payload (400) and unknown event type (404)', async () => {
    await request(server())
      .post('/bookings')
      .send({
        eventTypeId: 'intro-call',
        guestName: 'No Email',
        guestEmail: 'not-an-email',
        start: '2099-01-01T09:00:00.000Z',
      })
      .expect(400);

    await request(server())
      .post('/bookings')
      .send({
        eventTypeId: 'ghost',
        guestName: 'A',
        guestEmail: 'a@example.com',
        start: '2099-01-01T09:00:00.000Z',
      })
      .expect(404);
  });

  it('creates an event type and rejects a duplicate id (409)', async () => {
    const body = {
      id: 'sync-30',
      title: 'Sync',
      description: 'Weekly sync',
      durationMinutes: 30,
    };
    await request(server()).post('/event-types').send(body).expect(201);

    const dup = await request(server())
      .post('/event-types')
      .send(body)
      .expect(409);
    expect(dup.body.code).toBe('duplicate_id');

    await request(server())
      .post('/event-types')
      .send({ ...body, id: 'bad-duration', durationMinutes: 45 })
      .expect(400);
  });
});
