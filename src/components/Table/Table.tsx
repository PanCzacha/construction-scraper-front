import React from 'react';
import {MaterialRecordEntity} from "types";
import {Column, useTable} from 'react-table';
import "./Table.css";

interface Props {
    data: MaterialRecordEntity[],
    columns: Column[];
}

export function Table(props: Props) {
    const {columns, data} = props;

    const {
        // getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
        initialState: {
            hiddenColumns: ["id"],
        }
    })


    return (
        <table>
            <thead>
            {
                headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {
                            headerGroup.headers.map((column) => (
                                <th {...column.getHeaderProps()} scope="col">
                                    {column.render("Header")}
                                </th>
                            ))
                        }
                    </tr>
                ))
            }
            </thead>
            <tbody {...getTableBodyProps()}>
            {
                rows.map((row) => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map((cell) => {
                                return <td {...cell.getCellProps()}>
                                    {cell.render("Cell")}
                                </td>
                            })}
                        </tr>
                    );
                })
            }
            </tbody>
        </table>
    )
}
