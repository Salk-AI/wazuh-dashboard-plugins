import React, { useState, useEffect } from 'react';
import { SearchResponse } from '../../../../../../../src/core/server';
import { getPlugins } from '../../../../kibana-services';
import { ViewMode } from '../../../../../../../src/plugins/embeddable/public';
import { getDashboardPanels } from './dashboard-panels';
import { I18nProvider } from '@osd/i18n/react';
import useSearchBar from '../../../common/search-bar/use-search-bar';
import './styles.scss';
import { withErrorBoundary } from '../../../common/hocs';
import { DiscoverNoResults } from '../../../common/no-results/no-results';
import { LoadingSpinner } from '../../../common/loading-spinner/loading-spinner';
import { IndexPattern } from '../../../../../../../src/plugins/data/common';
import {
  ErrorFactory,
  ErrorHandler,
  HttpError,
} from '../../../../react-services/error-management';
import { compose } from 'redux';
import { SampleDataWarning } from '../../../visualize/components';
import { TSCDataSource } from '../../../common/data-source/pattern/alerts/tsc/tsc-data-souce';
import {
  AlertsDataSourceRepository,
  PatternDataSource,
  tParsedIndexPattern,
  useDataSource,
} from '../../../common/data-source';
import { useReportingCommunicateSearchContext } from '../../../common/hooks/use-reporting-communicate-search-context';

const plugins = getPlugins();

const SearchBar = getPlugins().data.ui.SearchBar;

const DashboardByRenderer = plugins.dashboard.DashboardContainerByValueRenderer;

const DashboardTSCComponent: React.FC = () => {
  const {
    filters,
    dataSource,
    fetchFilters,
    isLoading: isDataSourceLoading,
    fetchData,
    setFilters,
  } = useDataSource<tParsedIndexPattern, PatternDataSource>({
    DataSource: TSCDataSource,
    repository: new AlertsDataSourceRepository(),
  });
  const [results, setResults] = useState<SearchResponse>({} as SearchResponse);

  const { searchBarProps } = useSearchBar({
    indexPattern: dataSource?.indexPattern as IndexPattern,
    filters,
    setFilters,
  });

  const { query, dateRangeFrom, dateRangeTo } = searchBarProps;

  useReportingCommunicateSearchContext({
    isSearching: isDataSourceLoading,
    totalResults: results?.hits?.total ?? 0,
    indexPattern: dataSource?.indexPattern,
    filters: fetchFilters,
    query: query,
    time: {
      from: dateRangeFrom,
      to: dateRangeTo,
    },
  });

  useEffect(() => {
    if (isDataSourceLoading) {
      return;
    }
    fetchData({
      query,
      dateRange: {
        from: dateRangeFrom,
        to: dateRangeTo,
      },
    })
      .then(results => {
        setResults(results);
      })
      .catch(error => {
        const searchError = ErrorFactory.create(HttpError, {
          error,
          message: 'Error fetching alerts',
        });
        ErrorHandler.handleError(searchError);
      });
  }, [
    JSON.stringify(fetchFilters),
    JSON.stringify(query),
    JSON.stringify(dateRangeFrom),
    JSON.stringify(dateRangeTo),
  ]);

  return (
    <>
      <I18nProvider>
        <>
          {isDataSourceLoading && !dataSource ? (
            <LoadingSpinner />
          ) : (
            <div className='wz-search-bar hide-filter-control'>
              <SearchBar
                appName='tsc-searchbar'
                {...searchBarProps}
                showDatePicker={true}
                showQueryInput={true}
                showQueryBar={true}
              />
            </div>
          )}
          {dataSource && results?.hits?.total === 0 ? (
            <DiscoverNoResults />
          ) : null}
          {dataSource && results?.hits?.total > 0 ? (
            <>
              <SampleDataWarning />
              <div className='tsc-dashboard-responsive'>
                <DashboardByRenderer
                  input={{
                    viewMode: ViewMode.VIEW,
                    panels: getDashboardPanels(
                      dataSource?.id,
                      Boolean(dataSource.getPinnedAgentFilter()?.length),
                    ),
                    isFullScreenMode: false,
                    filters: fetchFilters ?? [],
                    useMargins: true,
                    id: 'tsc-dashboard-tab',
                    timeRange: {
                      from: searchBarProps.dateRangeFrom,
                      to: searchBarProps.dateRangeTo,
                    },
                    title: 'TSC dashboard',
                    description: 'Dashboard of the TSC',
                    query: searchBarProps.query,
                    refreshConfig: {
                      pause: false,
                      value: 15,
                    },
                    hidePanelTitles: false,
                  }}
                />
              </div>
            </>
          ) : null}
        </>
      </I18nProvider>
    </>
  );
};

export const DashboardTSC = compose(withErrorBoundary)(DashboardTSCComponent);
