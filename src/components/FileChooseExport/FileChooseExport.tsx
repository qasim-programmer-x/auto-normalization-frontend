import React, { useState, ChangeEvent, useEffect } from "react";
import { read, utils, writeFile } from "xlsx";
import "./FileChooseExport.scss";
import axios from "axios";
import { url } from "../../url";

interface Table {
  columns: string[];
  primary_key: string | string[];
  foreign_key?: { [key: string]: string };
}
interface ResponseData {
  [key: string]: Table; // This means the response can have any number of properties with string keys, each of type Table
}
export const FileChooseExport: React.FC = () => {
  const [response, setResponse] = useState<ResponseData>({});
  const [sqlLang, setSQLLang] = useState<string>("MySQL");
  const [sql, setSQL] = useState<string>("");
  // const [variables, setVariables] = useState<string[]>([]);
  const [variables, setVariables] = useState<string[][]>([]);
  const [sheets, setSheets] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]); // Use state for rows
  const [fileLoading, setLoading] = useState(false);
  const [normalizeLoading, setNormalizeLoading] = useState(false);
  const [sqlGenLoading, setSqlGenLoading] = useState(false);
  const [analyses, setAnalyses] = useState({});

  const handleImport = (event: ChangeEvent<HTMLInputElement>) => {
    if (fileLoading) return;
    setLoading(true);
    setVariables([]);
    setSheets([]);
    const files = event.target.files;
    if (files && files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          const wb = read(e.target.result);
          const sheets = wb.SheetNames;

          if (sheets.length) {
            setSheets(sheets);
            const newVariables: string[][] = []; // To hold the new variables for all sheets
            const rows: string[][] = utils.sheet_to_json(wb.Sheets[sheets[0]], { header: 1 });
            setRows(rows);

            if (rows.length != 0) {
              // console.log(rows);
              // console.log(rows[0]);
              // console.log(Object.values(rows[0]));
              // setVariables([Object.values(rows[0])]);
              newVariables.push(Object.values(rows[0]));
            }

            setVariables((prevVariables) => [...prevVariables, ...newVariables]);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
    setLoading(false);

    setTimeout(() => {
      window.scrollBy({
        top: 1000, // Number of pixels to scroll down
        behavior: "smooth", // Smooth scroll
      });
    }, 1000);
  };

  const handleExport = () => {
    const wb = utils.book_new();
    console.log("rows");
    console.log(rows);

    for (let table in response) {
      console.log(table);
      const ws = utils.json_to_sheet([]);
      const headers = response[table].columns;
      console.log(headers);

      utils.sheet_add_aoa(ws, [headers]);
      if (table.includes("Junction Table")) {
        utils.book_append_sheet(wb, ws, table.replace("Junction Table", ""));
      } else {
        utils.book_append_sheet(wb, ws, table);
      }

      const tableData: string[][] = [];
      let k = 0;
      for (let header of headers) {
        console.log(header);
        console.log(rows[0]);
        let j = rows[0].indexOf(header);
        console.log(j);

        tableData.push([]);
        for (let i = 1; i < rows.length; i++) {
          tableData[k].push(rows[i][j]);
          // console.log(tableData[k]);
        }

        k++;
      }
      console.log(tableData);
      const reorderedTableData = [];

      for (let i = 0; i < tableData[0].length; i++) {
        reorderedTableData.push([]);
        for (let j = 0; j < tableData.length; j++) {
          // reorderedTableData[i]
          (reorderedTableData[i] as any).push(tableData[j][i]);
        }
      }
      console.log(reorderedTableData);
      utils.sheet_add_json(ws, reorderedTableData, { origin: "A2", skipHeader: true });
    }

    // utils.sheet_add_aoa(ws, variables);
    // utils.sheet_add_json(ws, rows, { origin: "A2", skipHeader: true });
    // utils.book_append_sheet(wb, ws, "Report");
    writeFile(wb, "Normalized Tables.xlsx");
  };

  const handleNormalize = async () => {
    try {
      if (normalizeLoading) return;
      setNormalizeLoading(true);
      let message: string = "";
      console.log(rows);
      let i = 0;
      for (let row of rows) {
        for (let col of row) {
          message += col;
          message += " ";
        }
        i++;
        if (i > 5) {
          break;
        }
      }
      console.log(message);
      const response = await axios.post(`${url}/normalize`, {
        message: message,
      });
      console.log("response");
      console.log(response);
      setResponse(JSON.parse(response.data.data.choices[0].message.content));
      setNormalizeLoading(false);
    } catch (err: any) {
      setNormalizeLoading(false);
      alert(err);
      console.log(err);
    }
  };

  const handleAnalyse = async () => {
    try {
      console.log(rows.slice(1));
      const requestData = {
        headers: rows[0],
        rows: rows.slice(1, 71),
      };
      const response = await axios.post(`${url}/normalize/analyses`, requestData);
      console.log(response.data);
      setAnalyses(response.data);
    } catch (err: any) {
      alert(err);
      console.error(err);
    }
  };

  const handleSQLGeneration = async () => {
    try {
      setSqlGenLoading(true);
      const responseSQL = await axios.post(`${url}/generate-sql`, {
        data: JSON.stringify(response),
        sqlLang: sqlLang,
      });
      console.log("response SQL");
      console.log(responseSQL);
      setSQL(responseSQL.data.data.choices[0].message.content);
      setSqlGenLoading(false);
    } catch (err: any) {
      setSqlGenLoading(false);
      alert(err);
      console.log(err);
    }
  };

  const checkPrimaryKey = (table: string, column: string): string => {
    if (Array.isArray(response[table].primary_key)) {
      // console.log(`Array ${response[table].primary_key}`);
      if (response[table].primary_key.includes(column)) {
        return " (PK)";
      }
    } else if (typeof (response[table].primary_key == "string")) {
      // console.log(`string ${response[table].primary_key}`);
      if (response[table].primary_key == column) {
        return " (PK)";
      }
    }
    return "";
  };

  useEffect(() => {
    console.log(sql);
  }, [sql]);

  return (
    <div className="normalization-main">
      <h1>Choose a File to Get Started</h1>
      <div className="custom-file">
        <div className="file-upload">
          <label className="custom-file-label" htmlFor="inputGroupFile">
            {fileLoading ? <div className="loading-indicator"></div> : "Choose a File"}
          </label>
          <input
            type="file"
            name="file"
            className="custom-file-input"
            id="inputGroupFile"
            required
            onChange={handleImport}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          />
        </div>
      </div>
      {rows.length !== 0 ? (
        <>
          <h1 className="tables-header">Tables extracted from Excel File</h1>
          <div className="database-information">
            {sheets.map((sheet, index) => (
              <div id={`table-${index}`} key={index} className="table">
                <h1 className="table-title">{sheet}</h1>
                <hr></hr>

                {variables[index]
                  ? variables[index].map((variable, index) => (
                      <p className="table-variable" key={index}>
                        {variable}
                      </p>
                    ))
                  : null}
              </div>
            ))}
          </div>
          <div className="normalize-button-div">
            <button onClick={handleAnalyse} className="normalize-button">
              Analyse Attributes & Dependencies
            </button>
          </div>
          <div className="analyses-section-main">
            {Object.keys(analyses).length === 0
              ? null
              : Object.keys(analyses).map((key, index) => (
                  <div key={index} className="analyses-section">
                    <h3>{key}</h3>
                    <div>
                      {Array.isArray((analyses as any)[key])
                        ? (analyses as any)[key].map((item: any, idx: any) => (
                            <div className="item" key={idx}>
                              {typeof item === "object" ? `${item.determinant} -> ${item.dependent}` : item}
                            </div>
                          ))
                        : (analyses as any)[key]}
                    </div>
                  </div>
                ))}
          </div>{" "}
          <div className="normalize-button-div">
            <button onClick={handleNormalize} className="normalize-button">
              {normalizeLoading ? <div className="loading-indicator"></div> : "Normalize Tables"}
            </button>
          </div>
          {Object.keys(response).length === 0 ? null : (
            <>
              <h1 style={{ textAlign: "center" }}>Normalized Tables</h1>
              <div className="database-information">
                {Object.keys(response).map((table, index) => (
                  <div key={index} className="table">
                    <h1 className="table-title">{table}</h1>
                    <hr></hr>

                    {Array.isArray(response[table].columns)
                      ? response[table].columns.map((variable: string, varIndex: number) => (
                          <p className="table-variable" key={varIndex}>
                            {variable}
                            {checkPrimaryKey(table, variable)}
                          </p>
                        ))
                      : null}
                  </div>
                ))}
              </div>
              <div className="export-button-div">
                <button onClick={handleExport} className="export-button">
                  Export Normalized Tables in Excel <i className="fa fa-download"></i>
                </button>
              </div>
              <div className="normalize-button-div sql-button-gen-div">
                <div
                  className="dropdown"
                  onClick={() => {
                    const dropdown = document.getElementById("dropdown-items");
                    if (!dropdown) return;
                    dropdown.classList.toggle("dropdown-open");
                  }}
                >
                  <p>{sqlLang}</p>
                  <img width={25} src="/dropdown.png" alt="dropdown" />
                  <div id="dropdown-items" className="dropdown-items">
                    <p
                      onClick={() => {
                        setSQLLang("MySQL");
                      }}
                    >
                      MySQL
                    </p>
                    <p
                      onClick={() => {
                        setSQLLang("PostgreSQL");
                      }}
                    >
                      PostgreSQL
                    </p>
                  </div>
                </div>
                <button onClick={handleSQLGeneration} className="normalize-button">
                  {sqlGenLoading ? <div className="loading-indicator"></div> : "Generate SQL"}
                </button>
              </div>
              {sql === "" ? null : (
                <>
                  <h1 className="sql-gen-title">Generated SQL in {sqlLang}</h1>
                  <div className="sql-gen-div">
                    <div className="sql-gen-secondary">
                      <p>{sql}</p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </>
      ) : null}
    </div>
  );
};
