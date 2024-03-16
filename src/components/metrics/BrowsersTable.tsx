import FilterLink from 'components/common/FilterLink';
import MetricsTable, { MetricsTableProps } from 'components/metrics/MetricsTable';
import { useMessages } from 'components/hooks';
import { useFormat } from 'components/hooks';
import { BROWSERS } from 'lib/constants';
import { generateFromString } from 'generate-avatar';

export function BrowsersTable(props: MetricsTableProps) {
  const { formatMessage, labels } = useMessages();
  const { formatBrowser } = useFormat();

  function renderLink({ x: browser }) {
    const imgUrl = BROWSERS[browser]
      ? `${process.env.basePath}/images/browsers/${browser}.png`
      : `data:image/svg+xml;utf8,${generateFromString(browser)}`;
    return (
      <FilterLink id="browser" value={browser} label={formatBrowser(browser)}>
        <img
          src={imgUrl}
          alt={browser}
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
      title={formatMessage(labels.browsers)}
      type="browser"
      metric={formatMessage(labels.visitors)}
      renderLabel={renderLink}
    />
  );
}

export default BrowsersTable;
