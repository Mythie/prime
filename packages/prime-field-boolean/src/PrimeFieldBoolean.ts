import { PrimeField } from '@primecms/field';
import { GraphQLBoolean } from 'graphql';

interface Options {
  label: string;
  default: boolean;
}

export class PrimeFieldBoolean extends PrimeField {
  public static type = 'boolean';
  public static title = 'Boolean';
  public static description = 'Boolean field';

  public static defaultOptions: Options = {
    label: '',
    default: false,
  };

  public outputType(): any {
    return {
      type: GraphQLBoolean,
    };
  }

  public inputType(): any {
    return {
      type: GraphQLBoolean,
    };
  }

  public whereType(): any {
    return GraphQLBoolean;
  }

  public async processInput(value): Promise<boolean> {
    if (typeof value === 'undefined') {
      return this.options.default;
    }

    return Boolean(value);
  }

  public async processOutput(value): Promise<boolean> {
    if (typeof value === 'undefined') {
      return this.options.default;
    }

    return Boolean(value);
  }
}
