import React from 'react';

import { PrimeFieldProps } from '@primecms/field';
import { Form, Select, Switch } from 'antd';

interface ContentType {
  id: string;
  title: string;
  isSlice?: boolean;
  isTemplate?: boolean;
}

export class SchemaSettingsComponent extends React.PureComponent<PrimeFieldProps> {
  public render(): JSX.Element {
    const { form, stores } = this.props;

    return (
      <>
        <Form.Item label="Document types" style={{ marginBottom: 8 }}>
          {form.getFieldDecorator('options.schemaIds')(
            <Select placeholder="Select document types" mode="multiple">
              {stores.ContentTypes.list
                .filter((n: ContentType) => !n.isSlice && !n.isTemplate)
                .map((contentType: ContentType) => (
                  <Select.Option value={contentType.id} key={contentType.id}>
                    {contentType.title}
                  </Select.Option>
                ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="Options" style={{ marginBottom: -8 }} />
        <Form.Item>
          {form.getFieldDecorator('options.multiple', {
            valuePropName: 'checked',
          })(<Switch />)}
          <label htmlFor="options.multiple" style={{ marginLeft: 8 }}>
            Multiple
          </label>
        </Form.Item>
      </>
    );
  }
}
