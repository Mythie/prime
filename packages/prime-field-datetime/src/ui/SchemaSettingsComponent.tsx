import React from 'react';

import { PrimeFieldProps } from '@primecms/field';
import { Form, Switch } from 'antd';

type Props = PrimeFieldProps & {
  options: {
    time?: boolean;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { form, options = {} } = this.props;

    return (
      <>
        <Form.Item label="Options" style={{ marginBottom: -8 }} />
        <Form.Item help="Date vs. DateTime">
          {form.getFieldDecorator('options.time', {
            valuePropName: 'checked',
            initialValue: options.time || true,
          })(<Switch />)}
          <label htmlFor="options.time" style={{ marginLeft: 8 }}>
            Include timestamp
          </label>
        </Form.Item>
      </>
    );
  }
}
