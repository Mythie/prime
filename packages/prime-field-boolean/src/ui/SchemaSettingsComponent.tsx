import React from 'react';

import { PrimeFieldProps } from '@primecms/field';
import { Form, Input, Switch } from 'antd';

type Props = PrimeFieldProps & {
  options?: {
    label: string;
    default: boolean;
  };
};

export class SchemaSettingsComponent extends React.PureComponent<Props> {
  public render(): JSX.Element {
    const { form } = this.props;
    return (
      <>
        <Form.Item label="On by default">
          {form.getFieldDecorator('options.default', {
            valuePropName: 'checked',
          })(<Switch />)}
        </Form.Item>
        <Form.Item label="Label">{form.getFieldDecorator('options.label')(<Input />)}</Form.Item>
      </>
    );
  }
}
