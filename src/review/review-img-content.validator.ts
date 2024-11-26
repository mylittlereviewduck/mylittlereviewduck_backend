// import {
//   ValidatorConstraint,
//   ValidatorConstraintInterface,
//   ValidationArguments,
//   Validate,
// } from 'class-validator';

// @ValidatorConstraint({ name: 'isEqualLength', async: false })
// export class IsEqualLength implements ValidatorConstraintInterface {
//   validate(propertyValue: string[], args: ValidationArguments) {
//     const [relatedPropertyName] = args.constraints;
//     const relatedValue = args.object[relatedPropertyName];

//     if (relatedValue === undefined || propertyValue === undefined) {
//       return false;
//     }

//     return propertyValue.length === relatedValue.length;
//   }

//   defaultMessage(args: ValidationArguments) {
//     return `$property and ${args.constraints[0]} must have the same length`;
//   }
// }
