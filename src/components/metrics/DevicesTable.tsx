import MetricsTable, { MetricsTableProps } from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import { useMessages } from 'components/hooks';
import { useFormat } from 'components/hooks';
import { generateFromString } from 'generate-avatar';

export function DevicesTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { formatDevice } = useFormat();

  function renderLink({ x: device }) {
    return (
      <FilterLink
        id="device"
        value={labels[device] ? labels[device] : device}
        label={formatDevice(device)}
      >
        <img
          src={
            labels[device]
              ? `${process.env.basePath}/images/device/${device?.toLowerCase()}.png`
              : `data:image/svg+xml;utf8,${generateFromString(device)}`
          }
          alt={device}
          width={16}
          height={16}
        />
      </FilterLink>
    );
  }

  return (
    <MetricsTable
      {...props}
      title={formatMessage(labels.devices)}
      type="device"
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
    />
  );
}

export default DevicesTable;
