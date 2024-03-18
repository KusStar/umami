import MetricsTable, { MetricsTableProps } from './MetricsTable';
import FilterLink from 'components/common/FilterLink';
import { useMessages, useFormat } from 'components/hooks';
import { generateFromString } from 'generate-avatar';
import { OS_NAMES } from 'lib/constants';
import { uuid } from 'lib/crypto';

export function OSTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { formatOS } = useFormat();

  function renderLink({ x: os }) {
    return (
      <FilterLink id="os" value={os} label={formatOS(os)}>
        <img
          src={
            OS_NAMES[os]
              ? `${process.env.basePath || ''}/images/os/${
                  os?.toLowerCase().replaceAll(/\W/g, '-') || 'unknown'
                }.png`
              : `data:image/svg+xml;utf8,${generateFromString(os || uuid())}`
          }
          alt={os}
          width={16}
          height={16}
          style={{
            borderRadius: '20%',
          }}
        />
      </FilterLink>
    );
  }

  return (
    <MetricsTable
      {...props}
      type="os"
      title={formatMessage(labels.os)}
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
    />
  );
}

export default OSTable;
