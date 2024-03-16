import { useState } from 'react';
import { Grid, GridRow } from 'components/layout/Grid';
import PagesTable from 'components/metrics/PagesTable';
// import ReferrersTable from 'components/metrics/ReferrersTable';
import BrowsersTable from 'components/metrics/BrowsersTable';
import OSTable from 'components/metrics/OSTable';
import DevicesTable from 'components/metrics/DevicesTable';
import WorldMap from 'components/metrics/WorldMap';
import CountriesTable from 'components/metrics/CountriesTable';
import EventsTable from 'components/metrics/EventsTable';
import EventsChart from 'components/metrics/EventsChart';

export default function WebsiteTableView({
  websiteId,
  domainName,
}: {
  websiteId: string;
  domainName: string;
}) {
  const [countryData, setCountryData] = useState();
  const tableProps = {
    websiteId,
    domainName,
    limit: 10,
  };
  return (
    <Grid>
      <GridRow columns="three">
        <PagesTable {...tableProps} />
        <BrowsersTable {...tableProps} />
        <OSTable {...tableProps} />
      </GridRow>
      <GridRow columns="three">
        <DevicesTable {...tableProps} />
      </GridRow>
      <GridRow columns="two-one">
        <WorldMap data={countryData} />
        <CountriesTable {...tableProps} onDataLoad={setCountryData} />
      </GridRow>
      <GridRow columns="one-two">
        <EventsTable {...tableProps} />
        <EventsChart websiteId={websiteId} />
      </GridRow>
    </Grid>
  );
}
