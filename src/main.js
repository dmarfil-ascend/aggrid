import Vue from 'vue';
import { AgGridVue } from '@ag-grid-community/vue';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import '@ag-grid-community/core/dist/styles/ag-grid.css';
import '@ag-grid-community/core/dist/styles/ag-theme-alpine.css';

function actionCellRenderer(params) {
  let eGui = document.createElement('div');

  let editingCells = params.api.getEditingCells();
  // checks if the rowIndex matches in at least one of the editing cells
  let isCurrentRowEditing = editingCells.some((cell) => {
    return cell.rowIndex === params.node.rowIndex;
  });

  if (isCurrentRowEditing) {
    eGui.innerHTML = `
<button  class="action-button update"  data-action="update"> update  </button>
<button  class="action-button cancel"  data-action="cancel" > cancel </button>
`;
  } else {
    eGui.innerHTML = `
<button class="action-button edit"  data-action="edit" > edit  </button>
<button class="action-button delete" data-action="delete" > delete </button>
`;
  }

  return eGui;
}
const VueExample = {
  template: `
        <div style="height: 100%">
            <ag-grid-vue
                style="width: 100%; height: 600px;"
                class="ag-theme-alpine"
                id="myGrid"
                @grid-ready="onGridReady"
                @cell-clicked="onCellClicked"
                @row-editing-started="onRowEditingStarted"
                @row-editing-stopped="onRowEditingStopped"
                :gridOptions="gridOptions"
                :columnDefs="columnDefs"
                :defaultColDef="defaultColDef"
                :enableRangeSelection="true"
                :modules="modules"
                :rowData="rowData"
                :editType="editType"
                :suppressClickEdit="suppressClickEdit"
                ></ag-grid-vue>
        </div>
    `,
  components: {
    'ag-grid-vue': AgGridVue,
  },
  data: function () {
    return {
      gridOptions: null,
      gridApi: null,
      columnApi: null,
      columnDefs: null,
      defaultColDef: null,
      modules: [ClientSideRowModelModule, RangeSelectionModule],
      rowData: null,
    };
  },
  beforeMount() {
    this.gridOptions = {};
    this.editType = 'fullRow';
    this.suppressClickEdit = true;
    this.columnDefs = [
      { field: 'athlete', minWidth: 150 },
      { field: 'age', maxWidth: 90 },
      {
        headerName: 'action',
        minWidth: 150,
        cellRenderer: actionCellRenderer,
        editable: false,
        colId: 'action',
      },
    ];
    this.defaultColDef = {
      editable: true,
    };
  },
  mounted() {
    this.gridApi = this.gridOptions.api;
    this.gridColumnApi = this.gridOptions.columnApi;
  },
  methods: {
    onCellClicked(params) {
      // Handle click event for action cells
      if (
        params.column.colId === 'action' &&
        params.event.target.dataset.action
      ) {
        let action = params.event.target.dataset.action;

        if (action === 'edit') {
          params.api.startEditingCell({
            rowIndex: params.node.rowIndex,
            // gets the first columnKey
            colKey: params.columnApi.getDisplayedCenterColumns()[0].colId,
          });
        }

        if (action === 'delete') {
          params.api.applyTransaction({
            remove: [params.node.data],
          });
        }

        if (action === 'update') {
          params.api.stopEditing(false);
        }

        if (action === 'cancel') {
          params.api.stopEditing(true);
        }
      }
    },

    onRowEditingStarted: (params) => {
      params.api.refreshCells({
        columns: ['action'],
        rowNodes: [params.node],
        force: true,
      });
    },
    onRowEditingStopped: (params) => {
      params.api.refreshCells({
        columns: ['action'],
        rowNodes: [params.node],
        force: true,
      });
    },

    onGridReady(params) {
      const httpRequest = new XMLHttpRequest();
      const updateData = (data) => {
        this.rowData = data;
      };

      httpRequest.open(
        'GET',
        'https://www.ag-grid.com/example-assets/olympic-winners.json'
      );
      httpRequest.send();
      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
          updateData(JSON.parse(httpRequest.responseText));
        }
      };
    },
  },
};

new Vue({
  el: '#app',
  components: {
    'my-component': VueExample,
  },
});
