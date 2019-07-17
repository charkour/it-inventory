import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'
import {sortTable} from '../../../utilities/quickSort'
import {concatStyles as s} from '../../../utilities/mikesConcat'
import {cloneDeep} from 'lodash'
import {format} from '../../../utilities/formatEmptyStrings'
import {formatDate, calculateDaysEmployed, getDays} from '../../../utilities/FormatDate'

// Components
import {FilteredSearch} from '../../reusables/FilteredSearch/FilteredSearch'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {Table} from '../../reusables/Table/Table'

// Context
import {LoginContext} from '../../App/App'

// Styles
import styles from './EmployeesListPage.module.css'
import placeholder from '../../../content/Images/Placeholders/employee-placeholder.png'

// Types
interface IEmployeesListPageProps {
    history: any
    match: any
}

// Primary Component
export const EmployeesListPage: React.SFC<IEmployeesListPageProps> = props => {
    const {history, match} = props
    const {
        loginContextVariables: {accessToken, refreshToken},
    } = useContext(LoginContext)
    const axios = new AxiosService(accessToken, refreshToken)

    // state
    const [listData, setListData] = useState<any[]>([])
    const [filteredData, setFilteredData] = useState<any[]>([]) //this is what is used in the list
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState({label: 'Employees', value: 'name'})

    const columns = ['name', 'role', 'dateHired', 'daysEmployed', 'cost', 'hardware', 'programs']
    const headers = ['Employees', 'Role', 'Date Hired', 'Days Employed', 'Cost', 'Hardware', 'Programs']
    const options = columns.map((c, i) => ({label: headers[i], value: c}))

    const [useImages, setUseImages] = useState(false)
    const [images, setImages] = useState<{id: number; img: string}[]>([])
    const [displayImages] = useState<{id: number; img: string}[]>([])

    useEffect(() => {
        axios
            .get('/list/employees')
            .then((data: any) => {
                const employees: any[] = []
                var imgs: {id: number; img: string}[] = []
                data.map((i: any) => {
                    employees.push({
                        name: format(i.employeeName),
                        dateHired: formatDate(i.hireDate),
                        daysEmployedNumber: getDays(i.hireDate),
                        cost: formatCost(i.hardwareCostForEmp, i.programCostForEmp),
                        hwCost: i.hardwareCostForEmp,
                        swCost: i.programCostForEmp,
                        role: format(i.role),
                        icon: format(i.photo),
                        id: i.employeeId,

                        //for searching
                        hardware: i.hardwareList.join(', '),
                        programs: i.progForEmp.join(', '),
                        daysEmployed: calculateDaysEmployed(getDays(i.hireDate)),
                    })
                    imgs.push({id: i.employeeId, img: i.photo})
                })
                setListData(employees)

                setImages(imgs)
                setUseImages(true)
            })
            .catch((err: any) => console.error(err))
    }, [])

    useEffect(() => {
        // Search through listData based on current value
        // of search bar and save results in filtered
        var filteredTableInput = listData.filter((row: any) => {
            return !row[selected.value]
                ? false
                : row[selected.value]
                      .toString()
                      .toLowerCase()
                      .search(search.toLowerCase()) !== -1
        })
        setFilteredData(filteredTableInput)
    }, [search, selected, listData])

    //Set display Images
    useEffect(() => {
        images.map((img: {id: number; img: string}) =>
            checkImage(img).then(data => {
                var list = images.filter(i => i.id !== img.id)
                setImages([...list, data])
                displayImages.push(data)
            })
        )
    }, [useImages])

    //check image
    async function checkImage(img: {id: number; img: string}) {
        var arr: {id: number; img: string}[] = []
        await axios
            .get(img.img)
            .then((data: any) => {
                arr.push({id: img.id, img: data === '' ? placeholder : URL + img.img})
            })
            .catch((err: any) => console.error(err))

        return arr[0]
    }

    const formatCost = (hwCpost: number, progCost: number) => {
        return 'HW: $' + hwCpost + ' | SW: $' + progCost + ' /mo'
    }

    const handleClick = () => {
        history.push(`/editEmployee/new`)
    }

    const handleRowClick = (row: any) => {
        history.push(`${match.url}/${row[0].key}`)
    }

    var filteredRows: any[] = []
    filteredData.forEach(rowObj => {
        filteredRows.push(Object.values(rowObj))
    })

    const [rows, setRows] = useState(filteredRows)
    useEffect(() => {
        setRows(filteredRows)
    }, [filteredData])

    const headerList = ['Employees', 'Date Hired', 'Days Employed', 'Cost']

    //-------------- this will all be the same -------------
    const headerStates = []
    const headerStateCounts = []

    //initialize all the header states and styling to be not sorted
    for (let i = 0; i < headerList.length; i++) {
        headerStates.push(styles.descending)
        headerStateCounts.push(0)
    }
    //var initHeaderStates = cloneDeep(headerStates)
    var initHeaderStateCounts = cloneDeep(headerStateCounts)
    var tempHeaderStates = cloneDeep(headerStates)
    var tempHeaderStateCounts = cloneDeep(headerStateCounts)

    var initState = {headerStates, headerStateCounts}
    const [sortState, setSortState] = useState(initState)

    function sortStates(index: number) {
        if (sortState.headerStateCounts[index] === 0) {
            tempHeaderStates[index] = styles.descending
            tempHeaderStateCounts[index] = 1
            setSortState({headerStates: tempHeaderStates, headerStateCounts: tempHeaderStateCounts})
            tempHeaderStateCounts = [...initHeaderStateCounts]
        } else if (sortState.headerStateCounts[index] === 1) {
            tempHeaderStates[index] = styles.ascending
            tempHeaderStateCounts[index] = 0
            setSortState({headerStates: tempHeaderStates, headerStateCounts: tempHeaderStateCounts})
            tempHeaderStateCounts = [...initHeaderStateCounts]
        }
    }
    const renderHeaders = () => {
        var headers = []

        var firstHeader = (
            <td
                onClick={e => {
                    setRows(sortTable(rows, 0, sortState.headerStateCounts[0]))
                    sortStates(0)
                }}
            >
                <div className={s(styles.header, styles.nameHeader)}>
                    {headerList[0]}
                    <div className={sortState.headerStates[0]} />
                </div>
            </td>
        )
        headers.push(firstHeader)

        for (let i = 1; i < headerList.length; i++) {
            let header =
                i === 3 ? (
                    <td
                        onClick={e => {
                            setRows(sortTable(rows, i + 1, sortState.headerStateCounts[i]))
                            sortStates(i)
                        }}
                    >
                        <div className={styles.header}>
                            {headerList[i]}
                            <div className={sortState.headerStates[i]} />
                        </div>
                    </td>
                ) : (
                    <td
                        onClick={e => {
                            setRows(sortTable(rows, i, sortState.headerStateCounts[i]))
                            sortStates(i)
                        }}
                    >
                        <div className={styles.header}>
                            {headerList[i]}
                            <div className={sortState.headerStates[i]} />
                        </div>
                    </td>
                )
            headers.push(header)
        }

        return headers
    }

    function concatenatedName(row: any[]) {
        return displayImages &&
            displayImages.filter(x => x.id === row[8]) &&
            displayImages.filter(x => x.id === row[8])[0] ? (
            <td key={row[8]} className={styles.employees}>
                <img className={styles.icon} src={displayImages.filter(x => x.id === row[8])[0].img} alt={''} />
                <div className={styles.alignLeft}>
                    <text className={styles.employeeName}>{row[0]}</text> <br />
                    <text className={styles.role}>{row[6]}</text>
                </div>
            </td>
        ) : (
            <td key={row[8]} className={styles.employees}>
                <img className={styles.icon} src={placeholder} alt={''} />
                <div className={styles.alignLeft}>
                    <text className={styles.employeeName}>{row[0]}</text> <br />
                    <text className={styles.role}>{row[6]}</text>
                </div>
            </td>
        )
    }
    var renderedRows: any[] = []
    rows.forEach(row => {
        const transformedRow: any[] = []
        for (let i = 0; i < row.length; i++) {
            switch (i) {
                case 0:
                    transformedRow[0] = concatenatedName(row)
                case 1:
                    transformedRow[1] = <td className={styles.alignLeft}>{row[1]}</td>
                case 2:
                    transformedRow[2] = <td className={styles.alignLeft}>{calculateDaysEmployed(row[2])}</td>
                case 3:
                    transformedRow[3] = <td className={styles.alignLeft}>{formatCost(row[4], row[5])}</td>
            }
        }

        renderedRows.push(transformedRow)
    })

    return (
        <div className={styles.employeesListMain}>
            <Group direction='row' justify='between' className={styles.group}>
                <Button text='Add' icon='add' onClick={handleClick} />

                <FilteredSearch
                    search={search}
                    setSearch={setSearch}
                    options={options}
                    selected={selected}
                    setSelected={setSelected}
                />
            </Group>

            <Table headers={renderHeaders()} rows={renderedRows} onRowClick={handleRowClick} />
        </div>
    )
}
