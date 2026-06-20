import { registerDecorator, type ValidationOptions } from 'class-validator';
import { IANAZone } from 'luxon';

/** Validates that a number is a positive multiple of `factor`. */
export function IsMultipleOf(
  factor: number,
  options?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName) => {
    registerDecorator({
      name: 'isMultipleOf',
      target: object.constructor,
      propertyName: propertyName as string,
      constraints: [factor],
      options,
      validator: {
        validate: (value: unknown) =>
          typeof value === 'number' && value > 0 && value % factor === 0,
        defaultMessage: () =>
          `${propertyName as string} must be a positive multiple of ${factor}`,
      },
    });
  };
}

/** Validates that a string is a known IANA timezone (e.g. "Europe/Moscow"). */
export function IsIanaTimezone(options?: ValidationOptions): PropertyDecorator {
  return (object, propertyName) => {
    registerDecorator({
      name: 'isIanaTimezone',
      target: object.constructor,
      propertyName: propertyName as string,
      options,
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && IANAZone.isValidZone(value),
        defaultMessage: () =>
          `${propertyName as string} must be a valid IANA timezone`,
      },
    });
  };
}
