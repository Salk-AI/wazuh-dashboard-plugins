/*
 * Wazuh app - Office 365 Drilldown Operations field Config.
 *
 * Copyright (C) 2015-2022 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React from 'react';
import { ViewMode } from '../../../../../../../../src/plugins/embeddable/public';
import { getPlugins } from '../../../../../kibana-services';
import { DashboardPanelState } from '../../../../../../../../src/plugins/dashboard/public/application';
import { EmbeddableInput } from '../../../../../../../../src/plugins/embeddable/public';
import {
  getVisStateTopOfficeUsers,
  getVisStateOfficeCountryTagCloud,
  getVisStateOfficeAlertsEvolutionByUserID,
} from './visualizations';

const DashboardByRenderer =
  getPlugins().dashboard.DashboardContainerByValueRenderer;

const getDashboardPanels = (
  indexPatternId: string,
): {
  [panelId: string]: DashboardPanelState<
    EmbeddableInput & { [k: string]: unknown }
  >;
} => {
  return {
    d0: {
      gridData: {
        w: 19,
        h: 14,
        x: 0,
        y: 0,
        i: 'd0',
      },
      type: 'visualization',
      explicitInput: {
        id: 'd0',
        savedVis: getVisStateTopOfficeUsers(indexPatternId),
      },
    },
    d1: {
      gridData: {
        w: 29,
        h: 14,
        x: 19,
        y: 0,
        i: 'd1',
      },
      type: 'visualization',
      explicitInput: {
        id: 'd1',
        savedVis: getVisStateOfficeCountryTagCloud(indexPatternId),
      },
    },
    d2: {
      gridData: {
        w: 48,
        h: 11,
        x: 0,
        y: 14,
        i: 'd2',
      },
      type: 'visualization',
      explicitInput: {
        id: 'd2',
        savedVis: getVisStateOfficeAlertsEvolutionByUserID(indexPatternId),
      },
    },
  };
};

export const drilldownOperationsConfig = props => {
  const { fetchFilters, searchBarProps, indexPattern } = props;

  return {
    rows: [
      {
        columns: [
          {
            width: 100,
            component: props => {
              return (
                <div style={{ width: '100%' }}>
                  <DashboardByRenderer
                    input={{
                      viewMode: ViewMode.VIEW,
                      panels: getDashboardPanels(indexPattern.id),
                      isFullScreenMode: false,
                      filters: fetchFilters ?? [],
                      useMargins: true,
                      id: 'office-drilldown-operations-config-panel-tab',
                      timeRange: {
                        from: searchBarProps.dateRangeFrom,
                        to: searchBarProps.dateRangeTo,
                      },
                      title: 'Office drilldown operations config dashboard',
                      description:
                        'Dashboard of the Office drilldown operations config',
                      query: searchBarProps.query,
                      refreshConfig: {
                        pause: false,
                        value: 15,
                      },
                      hidePanelTitles: false,
                    }}
                    onInputUpdated={() => {}}
                  />
                </div>
              );
            },
          },
        ],
      },
    ],
  };
};
