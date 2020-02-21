import { PrimeField, PrimeFieldContext } from '@primecms/field';
import {
  GraphQLFloat,
  GraphQLInputFieldConfig,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLObjectType,
} from 'graphql';

interface Options {
  required: boolean;
}

const GeoPoint = new GraphQLObjectType({
  name: 'Prime_Field_GeoPoint',
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    zoom: { type: GraphQLInt },
  },
});

const GeoPointInput = new GraphQLInputObjectType({
  name: 'Prime_Field_GeoPoint_Input',
  fields: {
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    zoom: { type: GraphQLInt },
  },
});

export class PrimeFieldGeoPoint extends PrimeField {
  public static type = 'geopoint';
  public static title = 'Geo Point';
  public static description = 'Geo point field';
  public static defaultOptions: Options = {
    required: false,
  };

  public async outputType(context: PrimeFieldContext): Promise<any> {
    return {
      type: GeoPoint,
      description: this.schemaField.description,
    };
  }

  public async inputType(context: PrimeFieldContext): Promise<GraphQLInputFieldConfig> {
    return {
      type: GeoPointInput,
      description: this.schemaField.description,
    };
  }
}
