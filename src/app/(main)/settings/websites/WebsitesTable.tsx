import { ReactNode } from 'react';
import {
  Text,
  Icon,
  Icons,
  GridTable,
  GridColumn,
  useBreakpoint,
  ModalTrigger,
  Modal,
  Button,
} from 'react-basics';
import { useMessages, useTeamUrl } from 'components/hooks';
import LinkButton from 'components/common/LinkButton';
import TrackingCode from './[websiteId]/TrackingCode';

export interface WebsitesTableProps {
  data: any[];
  showActions?: boolean;
  allowEdit?: boolean;
  allowView?: boolean;
  teamId?: string;
  children?: ReactNode;
}

export function WebsitesTable({
  data = [],
  showActions,
  allowEdit,
  allowView,
  children,
}: WebsitesTableProps) {
  const { formatMessage, labels } = useMessages();
  const breakpoint = useBreakpoint();
  const { renderTeamUrl } = useTeamUrl();

  const hostUrl = `${process.env.hostUrl || window?.location.origin}${process.env.basePath}`;

  return (
    <GridTable data={data} cardMode={['xs', 'sm', 'md'].includes(breakpoint)}>
      <GridColumn name="id" label={formatMessage(labels.websiteId)} />
      <GridColumn name="name" label={formatMessage(labels.name)} />
      <GridColumn name="domain" label={formatMessage(labels.domain)} />
      {showActions && (
        <GridColumn name="action" label=" " alignment="end">
          {row => {
            const { id: websiteId } = row;
            return (
              <>
                <ModalTrigger>
                  <Button>
                    <Icon data-test="lnk-button-copy">
                      <Icons.Copy />
                    </Icon>
                  </Button>
                  <Modal title={formatMessage(labels.trackingCode)}>
                    {(close: () => void) => (
                      <div style={{ width: 500 }}>
                        <TrackingCode websiteId={websiteId} hostUrl={hostUrl} />
                        <Button onClick={close} style={{ marginTop: 8 }}>
                          <Icon>
                            <Icons.Close />
                          </Icon>
                          <Text>{formatMessage(labels.back)}</Text>
                        </Button>
                      </div>
                    )}
                  </Modal>
                </ModalTrigger>
                {allowEdit && (
                  <LinkButton href={renderTeamUrl(`/settings/websites/${websiteId}`)}>
                    <Icon data-test="link-button-edit">
                      <Icons.Edit />
                    </Icon>
                    <Text>{formatMessage(labels.edit)}</Text>
                  </LinkButton>
                )}
                {allowView && (
                  <LinkButton href={renderTeamUrl(`/websites/${websiteId}`)}>
                    <Icon>
                      <Icons.ArrowRight />
                    </Icon>
                    <Text>{formatMessage(labels.view)}</Text>
                  </LinkButton>
                )}
              </>
            );
          }}
        </GridColumn>
      )}
      {children}
    </GridTable>
  );
}

export default WebsitesTable;
