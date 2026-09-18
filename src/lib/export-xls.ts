export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  type?: 'string' | 'number' | 'currency' | 'percent' | 'date';
}

/**
 * Exports data array to a styled Microsoft Excel (.xls) file.
 * Uses XML Spreadsheet 2003 format with styling for colors, numbers, and column widths.
 */
export function exportToXls(
  filename: string,
  data: Record<string, any>[],
  columns: ExcelColumn[],
  sheetName: string = 'Report'
) {
  const sanitize = (val: any) => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const headerXml = columns
    .map(
      (col) =>
        `<Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${sanitize(col.header)}</Data></Cell>`
    )
    .join('');

  const rowsXml = data
    .map((row) => {
      const cellsXml = columns
        .map((col) => {
          const val = row[col.key];
          if (val === null || val === undefined || val === '') {
            return '<Cell ss:StyleID="DefaultStyle"><Data ss:Type="String">—</Data></Cell>';
          }

          if (col.type === 'number' || col.type === 'currency' || typeof val === 'number') {
            const num = Number(val);
            const style = col.type === 'currency' ? 'CurrencyStyle' : 'NumberStyle';
            return `<Cell ss:StyleID="${style}"><Data ss:Type="Number">${isNaN(num) ? 0 : num}</Data></Cell>`;
          }

          if (col.type === 'percent') {
            const num = Number(val) / 100;
            return `<Cell ss:StyleID="PercentStyle"><Data ss:Type="Number">${isNaN(num) ? 0 : num}</Data></Cell>`;
          }

          return `<Cell ss:StyleID="DefaultStyle"><Data ss:Type="String">${sanitize(val)}</Data></Cell>`;
        })
        .join('');

      return `<Row>${cellsXml}</Row>`;
    })
    .join('\n');

  const columnWidthsXml = columns
    .map((col) => `<Column ss:Width="${col.width || 120}" />`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1F2937"/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4B146E"/>
   </Borders>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#4B146E" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="DefaultStyle">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#374151"/>
  </Style>
  <Style ss:ID="NumberStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#374151"/>
  </Style>
  <Style ss:ID="CurrencyStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="&quot;MYR &quot;#,##0.00"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#111827" ss:Bold="1"/>
  </Style>
  <Style ss:ID="PercentStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="0.0%"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#374151"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sanitize(sheetName)}">
  <Table ss:DefaultRowHeight="20">
   ${columnWidthsXml}
   <Row ss:Height="26">
    ${headerXml}
   </Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.xls') ? filename : `${filename}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
