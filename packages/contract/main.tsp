import "@typespec/http";
import "@typespec/rest";

using Http;
using Rest;

/**
 * Calendar of calls — API contract (single source of truth).
 *
 * Design First: change behavior here, regenerate OpenAPI (`npm run contract:build`),
 * then implement the Nest.js backend and React frontend independently against it.
 *
 * Domain (see CLAUDE.md / docs/step2.md):
 *  - One fixed owner, no authentication. Guests book anonymously.
 *  - The owner creates event types and configures a weekly availability schedule.
 *  - Bookable slots for an event type are derived from the availability schedule
 *    intersected with a rolling 14-day window from today, sliced into the event
 *    type's `durationMinutes` on a 30-minute grid, and emitted as UTC instants.
 *  - A time cannot be booked twice — even across different event types. Overlap is
 *    checked against the [start, end) interval of every existing booking.
 */
@service(#{ title: "Calendar of Calls API" })
namespace CallsApi;

// ---------------------------------------------------------------------------
// Shared error model
// ---------------------------------------------------------------------------

/** Machine-readable error returned for non-2xx responses. */
@error
model ApiError {
  /** Stable error code, e.g. "not_found", "slot_taken", "duplicate_id". */
  code: string;

  /** Human-readable explanation. */
  message: string;
}

model BadRequestError extends ApiError {
  @statusCode statusCode: 400;
}

model NotFoundError extends ApiError {
  @statusCode statusCode: 404;
}

model ConflictError extends ApiError {
  @statusCode statusCode: 409;
}

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

/** A type of meeting the owner offers (e.g. "Intro call"). */
model EventType {
  /** Owner-assigned slug, unique across event types (e.g. "intro-call"). */
  id: string;

  title: string;
  description: string;

  /** Meeting length in minutes; must be a positive multiple of 30. */
  @minValue(1)
  durationMinutes: int32;
}

/** Payload to create an event type. The owner assigns the `id`. */
model EventTypeCreate {
  /** Owner-assigned slug, unique across event types (e.g. "intro-call"). */
  id: string;

  title: string;
  description: string;

  /** Meeting length in minutes; must be a positive multiple of 30. */
  @minValue(1)
  durationMinutes: int32;
}

// ---------------------------------------------------------------------------
// Availability (single owner-level weekly schedule)
// ---------------------------------------------------------------------------

enum Weekday {
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
  sunday,
}

/** A working interval within a day, expressed in the schedule's timezone. */
model TimeRange {
  /** Inclusive start time, "HH:MM" 24-hour (e.g. "09:00"). */
  start: string;

  /** Exclusive end time, "HH:MM" 24-hour (e.g. "17:00"). */
  end: string;
}

/** Working intervals for a single weekday. An empty list means a day off. */
model DayAvailability {
  weekday: Weekday;
  ranges: TimeRange[];
}

/** The owner's recurring weekly availability. */
model AvailabilitySchedule {
  /** IANA timezone the working hours are interpreted in (e.g. "Europe/Moscow"). */
  timezone: string;

  /** Working hours per weekday. */
  week: DayAvailability[];
}

// ---------------------------------------------------------------------------
// Slots & bookings
// ---------------------------------------------------------------------------

/** A candidate booking slot for an event type. */
model Slot {
  /** Slot start (ISO 8601, UTC). */
  start: utcDateTime;

  /** Slot end (ISO 8601, UTC), = start + event type durationMinutes. */
  end: utcDateTime;

  /** False when the slot overlaps an existing booking of any event type. */
  available: boolean;
}

/** A confirmed reservation of a slot by a guest. */
model Booking {
  /** Server-generated identifier. */
  id: string;

  eventTypeId: string;
  guestName: string;
  guestEmail: string;
  start: utcDateTime;

  /** = start + event type durationMinutes. */
  end: utcDateTime;
}

/** Payload a guest submits to book a slot. The server computes `end`. */
model BookingCreate {
  eventTypeId: string;
  guestName: string;
  guestEmail: string;

  /** Start of the chosen slot (ISO 8601, UTC). Must match an available slot. */
  start: utcDateTime;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

@route("/event-types")
namespace EventTypes {
  /** List all event types (owner admin + guest catalog). */
  @get op list(): EventType[];

  /** Create an event type (owner). */
  @post op create(
    @body body: EventTypeCreate,
  ): {
    @statusCode statusCode: 201;
    @body body: EventType;
  } | BadRequestError | ConflictError;

  /** Get a single event type by id (guest booking page). */
  @get op get(@path id: string): EventType | NotFoundError;

  /**
   * List slots for an event type. Defaults to the rolling 14-day window from
   * today; `from`/`to` may narrow it (UTC, ISO 8601).
   */
  @route("/{id}/slots")
  @get
  op listSlots(
    @path id: string,
    @query from?: utcDateTime,
    @query to?: utcDateTime,
  ): Slot[] | NotFoundError;
}

@route("/availability")
namespace Availability {
  /** Get the owner's weekly availability schedule. */
  @get op get(): AvailabilitySchedule;

  /** Replace the owner's weekly availability schedule. */
  @put op replace(
    @body body: AvailabilitySchedule,
  ): AvailabilitySchedule | BadRequestError;
}

@route("/bookings")
namespace Bookings {
  /** Owner: list all upcoming bookings across every event type. */
  @get op list(): Booking[];

  /** Guest: book a free slot. */
  @post op create(
    @body body: BookingCreate,
  ): {
    @statusCode statusCode: 201;
    @body body: Booking;
  } | BadRequestError | NotFoundError | ConflictError;
}
