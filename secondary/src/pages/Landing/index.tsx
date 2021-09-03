import React, { FC, useEffect, useState } from 'react';
import { Affix, Button, Form, Input, Modal, Select } from 'antd';
import { useHistory } from 'react-router-dom';
import { RDCRoleType } from 'agora-rdc-core';
import { SettingTwoTone } from '@ant-design/icons';
import { joinSession } from '../../api';
import { Options } from '../../interfaces';
import { RESOLUTION_BITRATE } from '../../constants';

const frameRates: number[] = [10, 15, 30, 60];

const Landing: FC = () => {
  const history = useHistory();
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm<Partial<Options>>();

  useEffect(() => {
    const opts = JSON.parse(
      localStorage.getItem('RDC_OPTS') ?? JSON.stringify({ resolutionBitrate: '1080p2000', rtcSDK: 'electron' }),
    );
    form.setFieldsValue(opts);
  }, [form]);

  const onFinish = async (values: { channel: string }) => {
    const {
      data: { uid },
    } = await joinSession(values.channel, RDCRoleType.CONTROLLED);
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
        onOk={handleOptionsOk}
        forceRender={true}>
        <Form labelCol={{ span: 10 }} form={form}>
          <Form.Item label="RTC SDK" name="rtcSDK">
            <Select>
              <Select.Option value="electron">agora-sdk-electron</Select.Option>
              <Select.Option value="web">agora-rtc-sdk-ng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Resolution and Bitrate" name="resolutionBitrate">
            <Select>
              {Object.keys(RESOLUTION_BITRATE).map((key) => {
                const { width, height, bitrate } = RESOLUTION_BITRATE[key];
                return (
                  <Select.Option value={key} key={key}>
                    {width} x {height}, {bitrate} bps
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item label="Framerate" name="frameRate">
            <Select>
              {frameRates.map((rate) => (
                <Select.Option value={rate} key={rate}>
                  {rate} fps
                </Select.Option>
              ))}
            </Select>
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
