import { Affix, Button, Form, Input, InputNumber, Modal, Select } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { RDCRoleType } from 'agora-rdc-core';
import { SettingTwoTone } from '@ant-design/icons';
import { joinSession } from '../../api';
import { Options } from '../../interfaces';

const Landing: FC = () => {
  const history = useHistory();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm<Partial<Options>>();

  useEffect(() => {
    const opts = JSON.parse(
      localStorage.getItem('RDC_OPTS') ??
        JSON.stringify({ mouseEventsThreshold: 30, keyboardEventsThreshold: 30, rtcSDK: 'electron' }),
    );
    form.setFieldsValue(opts);
  }, [form]);

  const onFinish = async (values: { channel: string }) => {
    const {
      data: { uid },
    } = await joinSession(values.channel, RDCRoleType.HOST);
    const opts = form.getFieldsValue();
    history.push(`/session/${uid}?opts=${window.btoa(JSON.stringify(opts))}`);
  };

  const handleOptionsOk = async () => {
    const opts = await form.validateFields();
    localStorage.setItem('RDC_OPTS', JSON.stringify(opts));
    setVisible(false);
  };

  const handleOptionsCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <Affix style={{ position: 'absolute', right: 10, top: 10 }}>
        <Button shape="circle" icon={<SettingTwoTone />} type="dashed" onClick={() => setVisible(true)} />
      </Affix>
      <Modal
        title="RDC Options"
        visible={visible}
        closable={false}
        onCancel={handleOptionsCancel}
        onOk={handleOptionsOk}>
        <Form labelCol={{ span: 12 }} form={form}>
          <Form.Item label="RTC SDK" name="rtcSDK">
            <Select>
              <Select.Option value="electron">agora-sdk-electron</Select.Option>
              <Select.Option value="web">agora-rtc-sdk-ng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Mouse Events Threshold(ms)"
            name="mouseEventsThreshold"
            rules={[{ type: 'number', min: 0, max: 500, message: 'Mouse Events Threshold must be in 0 ~ 500' }]}>
            <InputNumber style={{ width: '100%' }} step={10} />
          </Form.Item>
          <Form.Item
            label="Keyboard Events Threshold(ms)"
            name="keyboardEventsThreshold"
            rules={[{ type: 'number', min: 0, max: 500, message: 'Mouse Events Threshold must be in 0 ~ 500' }]}>
            <InputNumber style={{ width: '100%' }} step={10} />
          </Form.Item>
        </Form>
      </Modal>
      <Form
        style={{ marginTop: 160 }}
        name="landing"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
        onFinish={onFinish}>
        <Form.Item label="Channel" name="channel" rules={[{ required: true, message: 'Please input Channel!' }]}>
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 8 }}>
          <Button type="primary" htmlType="submit" block>
            JOIN
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default Landing;
