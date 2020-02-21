import { PrimeField, PrimeFieldContext } from '@primecms/field';
import { ValidationError } from 'apollo-server-core';
import {
  GraphQLFloat,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
} from 'graphql';

interface Options {
  float: boolean;
  rules?: {
    required?: boolean;
    min?: boolean;
    minValue?: number;
    max?: boolean;
    maxValue?: number;
  };
}

const WhereFloat = new GraphQLInputObjectType({
  name: `PrimeField_Number_WhereFloat`,
  fields: {
    neq: { type: GraphQLFloat },
    eq: { type: GraphQLFloat },
    gt: { type: GraphQLFloat },
    lt: { type: GraphQLFloat },
    gte: { type: GraphQLFloat },
    lte: { type: GraphQLFloat },
  },
});

const WhereInt = new GraphQLInputObjectType({
  name: `PrimeField_Number_WhereInt`,
  fields: {
    neq: { type: GraphQLInt },
    eq: { type: GraphQLInt },
    gt: { type: GraphQLInt },
    lt: { type: GraphQLInt },
    gte: { type: GraphQLInt },
    lte: { type: GraphQLInt },
  },
});

export class PrimeFieldNumber extends PrimeField {
  public static type = 'number';
  public static title = 'Number';
  public static description = 'Number field';
  public static defaultOptions: Options = {
    float: true,
    rules: {},
  };

  public async outputType(context: PrimeFieldContext): Promise<any> {
    const { float } = this.options;

    return {
      type: float ? GraphQLFloat : GraphQLInt,
      description: this.schemaField.description,
    };
  }

  public async inputType(context: PrimeFieldContext): Promise<GraphQLInputFieldConfig> {
    const { float, rules } = this.options;
    const type = float ? GraphQLFloat : GraphQLInt;

    return {
      type: rules.required ? new GraphQLNonNull(type) : type,
      description: this.schemaField.description,
    };
  }

  public async whereType(context: PrimeFieldContext): Promise<GraphQLInputObjectType> {
    const { float } = this.options;
    return float ? WhereFloat : WhereInt;
  }

  // One would this this would return a number but it looks like it could
  // also be a string or undefined
  public processInput(value): any {
    const { rules } = this.options;
    const { name } = this.schemaField;

    if (!this.options.float) {
      value = parseInt(value, 10);
    }

    const num = Number(value);

    if (rules.required) {
      if (value === '' || value === undefined || value === null) {
        throw new ValidationError(`Field '${name}' is required`);
      }
    }

    if (rules.min && rules.minValue) {
      const min = Number(rules.minValue);
      if (num < min) {
        throw new ValidationError(`Field '${name}' must be greater or equal to ${min}`);
      }
    }

    if (rules.max && rules.maxValue) {
      const max = Number(rules.maxValue);
      if (num > max) {
        throw new ValidationError(`Field '${name}' must be less or equal to ${max}`);
      }
    }

    return value;
  }
}
