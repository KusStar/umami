import { TextArea, Tabs, Item } from 'react-basics';
import { useMessages, useConfig } from 'components/hooks';
import { Key, useState } from 'react';
import { genJavaCode, genJsCode, genKotlinCode, genSwiftCode, genTsCode } from './codeTemplates';

const SCRIPT_NAME = 'script.js';

export function TrackingCode({ websiteId, hostUrl }: { websiteId: string; hostUrl?: string }) {
  const { formatMessage, messages } = useMessages();
  const config = useConfig();
  const [tab, setTab] = useState<Key>('html');

  const trackerScriptName =
    config?.trackerScriptName?.split(',')?.map((n: string) => n.trim())?.[0] || SCRIPT_NAME;

  const url = trackerScriptName?.startsWith('http')
    ? trackerScriptName
    : `${hostUrl || process.env.hostUrl || window?.location.origin}${
        process.env.basePath
      }/${trackerScriptName}`;

  const htmlCode = `<script defer src="${url}" data-website-id="${websiteId}"></script>`;

  const endpoint = `${hostUrl || process.env.hostUrl || window?.location.origin}${
    process.env.basePath
  }`;

  const tsCode = genTsCode(websiteId, endpoint);
  const jsCode = genJsCode(websiteId, endpoint);
  const kotlinCode = genKotlinCode(websiteId, endpoint);
  const javaCode = genJavaCode(websiteId, endpoint);
  const swiftCode = genSwiftCode(websiteId, endpoint);

  return (
    <>
      <Tabs selectedKey={tab} onSelect={setTab} style={{ marginBottom: 12, marginTop: -12 }}>
        <Item key="html">HTML</Item>
        <Item key="ts">TypeScript</Item>
        <Item key="js">JavaScript</Item>
        <Item key="kotlin">Kotlin</Item>
        <Item key="java">Java</Item>
        <Item key="swift">Swift</Item>
      </Tabs>
      {tab === 'html' && (
        <>
          <p>{formatMessage(messages.trackingCode)}</p>
          <TextArea rows={4} value={htmlCode} readOnly allowCopy />
        </>
      )}
      {tab === 'ts' && <TextArea rows={18} value={tsCode} readOnly allowCopy />}
      {tab === 'js' && <TextArea rows={18} value={jsCode} readOnly allowCopy />}
      {tab === 'kotlin' && <TextArea rows={18} value={kotlinCode} readOnly allowCopy />}
      {tab === 'java' && <TextArea rows={18} value={javaCode} readOnly allowCopy />}
      {tab === 'swift' && <TextArea rows={18} value={swiftCode} readOnly allowCopy />}
    </>
  );
}

export default TrackingCode;
