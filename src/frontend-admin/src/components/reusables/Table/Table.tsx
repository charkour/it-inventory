import React from 'react'

import {concatStyles as s} from '../../../utilities/mikesConcat'
import styles from './Table.module.css'

interface ITableProps {
    headers: JSX.Element[]
    rows: Element[][]
    onRowClick?: (datum: Element[]) => void
}

export const Table = (props: ITableProps) => {
    const {headers, rows, onRowClick} = props
    const isClickable = Boolean(onRowClick)

    return (
        <table className={s(styles.table, isClickable && styles.clickable)}>
            <thead>
                <tr>{headers.map(header => header)}</tr>
            </thead>

            <tbody>
                {rows.map(row => (
                    <tr
                        key={Math.random()}
                        className={s(styles.tr, isClickable && styles.clickable)}
                        onClick={ onRowClick ? e => { onRowClick(row) } : undefined }
                    >
                        {row}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
