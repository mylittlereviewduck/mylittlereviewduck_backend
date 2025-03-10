import { registerDecorator, ValidationOptions } from 'class-validator';

export const Match = (
  property: string,
  validationOptions?: ValidationOptions,
) => {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate: (value, args) => value === args.object[args.constraints[0]],
      },
    });
  };
};
