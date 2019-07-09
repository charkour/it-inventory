import React, {useState, useEffect, useContext} from 'react'
import {AxiosService, URL} from '../../../services/AxiosService/AxiosService'

// Components
import {DetailPageTable} from '../../reusables/DetailPageTable/DetailPageTable'
import {Button} from '../../reusables/Button/Button'
import {Group} from '../../reusables/Group/Group'
import {DropdownList} from '../../reusables/Dropdown/DropdownList'

// Utils
import {formatDate, getDays, calculateDaysEmployed} from '../../../utilities/FormatDate'
import {format} from '../../../utilities/formatEmptyStrings'
import {concatStyles as s} from '../../../utilities/mikesConcat'

// Styles
import styles from './EmployeeDetailPage.module.css'
import dropdownStyles from '../../reusables/Dropdown/Dropdown.module.css'

// Context
import {LoginContext} from '../../App/App'

// Types
interface IEmployeeDetailPageProps {
    match: any
    history: any
}

// Helpers

// Primary Component
export const EmployeeDetailPage: React.SFC<IEmployeeDetailPageProps> = props => {
    const {history, match} = props

    const {
        loginContextVariables: {accessToken, refreshToken /*, isAdmin*/},
    } = useContext(LoginContext)
    const isAdmin = true //TODO: remove

    const axios = new AxiosService(accessToken, refreshToken)
    const [userData, setUserData] = useState<any>({})
    const [hardwareRows, setHardwareRows] = useState<any[]>([])
    const [softwareRows, setSoftwareRows] = useState<any[]>([])
    const [licenseRows, setLicenseRows] = useState<any[]>([])

    const hardwareHeaders = ['Hardware', 'Serial Number', 'MFG Tag', 'Purchase Date']
    const softwareHeaders = ['Software', 'Key/Username', 'Monthly Cost']
    const licenseHeaders = ['Licenses', 'Key/Username', 'Monthly Cost', 'CALs']

    const [hardwareDropdown, setHardwareDropdown] = useState<any[]>()
    const [softwareDropdown, setSoftwareDropdown] = useState<any[]>()
    const [licenseDropdown, setLicenseDropdown] = useState<any[]>()

    const formatToolTip = (obj: any) => obj.cpu + ' | ' + obj.ramgb + 'GB | ' + obj.ssdgb + 'GB'

    const handleHardwareClick = (id: number | string) => {
        history.push(`/hardware/${id}`)
    }

    const handleProgramClick = (id: number | string) => {
        history.push(`/programs/overview/${id}`)
    }

    useEffect(() => {
        axios
            .get(`/detail/employee/${match.params.id}`)
            .then((data: any) => {
                let user: any = {
                    photo: data[0].picture,
                    name: data[0].firstName + ' ' + data[0].lastName,
                    department: data[0].department,
                    role: data[0].role,
                    hireDate: formatDate(data[0].hireDate),
                    hwCost: Math.round(data[0].totalHardwareCost * 100) / 100,
                    swCost: Math.round(data[0].totalProgramCostMonthly * 100) / 100,
                }
                console.log(data)
                setUserData(user)

                let hw: any[] = []
                data[0].hardware.map((i: any) =>
                    hw.push([
                        {
                            value: format(i.make + ' ' + i.model),
                            id: format(i.type.toLowerCase() + '/' + i.id),
                            tooltip: i.tooltip.cpu ? formatToolTip(i.tooltip) : '',
                            onClick: handleHardwareClick,
                            sortBy: i.make + ' ' + i.model,
                        },
                        {value: format(i.serialNumber), id: format(i.id), sortBy: i.serialNumber},
                        {value: format(i.mfg), id: format(i.id), sortBy: i.mfg},
                        {value: formatDate(i.purchaseDate), id: format(i.id), sortBy: i.purchaseDate},
                    ])
                )
                setHardwareRows(hw)

                let sw: any[] = []
                data[0].software.map((i: any) =>
                    sw.push([
                        {
                            value: format(i.name),
                            id: format(i.id),
                            onClick: handleProgramClick,
                            sortBy: i.name,
                        },
                        {value: format(i.licenseKey), id: format(i.id), sortBy: i.licenseKey},
                        {
                            value: '$' + format(Math.round(i.costPerMonth * 100) / 100),
                            id: format(i.id),
                            sortBy: i.costPerMonth,
                        },
                    ])
                )
                setSoftwareRows(sw)

                let l: any[] = []
                data[0].licenses.map((i: any) =>
                    l.push([
                        {
                            value: format(i.name),
                            id: format(i.id),
                            onClick: handleProgramClick,
                            sortBy: i.name,
                        },
                        {
                            value: format(i.licenseKey),
                            id: format(i.id),
                            sortBy: format(i.licenseKey),
                        },
                        {
                            value: '$' + format(Math.round(i.costPerMonth * 100) / 100),
                            sortBy: i.costPerMonth,
                        },
                        {value: format(i.cals), id: format(i.id), sortBy: i.cals},
                    ])
                )
                setLicenseRows(l)

                let uhw: any[] = []
                data[0].unassignedHardware.map((i: any) =>
                    uhw.push({
                        name: i.monitorName ? i.monitorName : i.compName ? i.compName : i.periphName,
                        id: i.monitorId
                            ? i.type.toLowerCase() + '/' + i.monitorId
                            : i.computerId
                            ? i.type.toLowerCase() + '/' + i.computerId
                            : i.type.toLowerCase() + '/' + i.peripheralId,
                    })
                )
                setHardwareDropdown(uhw)

                let usw: any[] = []
                data[0].unassignedSoftware.map((i: any) =>
                    usw.push({
                        name: i.programName,
                        id: i.programId,
                    })
                )
                setSoftwareDropdown(usw)

                let ul: any[] = []
                data[0].unassignedLicenses.map((i: any) =>
                    ul.push({
                        name: i.programName,
                        id: i.programId,
                    })
                )
                setLicenseDropdown(ul)
            })
            .catch((err: any) => console.error(err))
    }, [])

    const handleArchive = () => {
        if (window.confirm(`Are you sure you want to archive ${userData.name}?`)) {
            //TODO: a post request to archive user w/ id match.params.id
            history.push('/employees')
        }
    }

    const handleAddHardware = (id: number) => {
        //TODO: post request to assign hardware to user w/ id match.params.id
        //then refresh the page so the changes are shown?
    }

    const handleAddSoftware = (id: number) => {
        //TODO: post request to assign software to user w/ id match.params.id
    }

    const handleAddLicense = (id: number) => {
        //TODO: post request to assign license to user w/ id match.params.id
    }

    return (
        <div className={styles.empDetailMain}>
            <div className={styles.columns}>
                {/* column 1 */}
                <div className={styles.firstColumn}>
                    <Button
                        text='All Employees'
                        icon='back'
                        onClick={() => {
                            history.push('/employees')
                        }}
                        className={styles.backButton}
                        textClassName={styles.backButtonText}
                    />
                    <div className={styles.imgPadding}>
                        <img className={styles.img} src={URL + userData.photo} alt={''} />
                    </div>
                    <div className={styles.costText}>
                        <p>Software ---------------- ${userData.swCost} /month</p>
                        <p>Hardware --------------- ${userData.hwCost}</p>
                    </div>
                </div>
                {/* column 2 */}
                <div className={styles.secondColumn}>
                    {isAdmin && (
                        <Group direction='row' justify='start' className={styles.group}>
                            <Button
                                text='Edit'
                                icon='edit'
                                onClick={() => {
                                    history.push('/editEmployee/' + match.params.id)
                                }}
                                className={styles.editbutton}
                            />

                            <Button
                                text='Archive'
                                icon='archive'
                                onClick={handleArchive}
                                className={styles.archivebutton}
                            />
                        </Group>
                    )}
                    <div className={styles.titleText}>
                        <div className={styles.employeeName}>{userData.name}</div>
                        <div className={styles.employeeText}>
                            {userData.department} | {userData.role}
                        </div>
                        <div className={styles.employeeText}>
                            Hired: {userData.hireDate} | {calculateDaysEmployed(getDays(userData.hireDate))}
                        </div>
                    </div>
                    <DetailPageTable headers={hardwareHeaders} rows={hardwareRows} setRows={setHardwareRows} />
                    {isAdmin && hardwareDropdown && (
                        <Button
                            className={s(styles.addContainer, styles.dropdown3)}
                            icon='add'
                            onClick={() => {}}
                            textInside={false}
                        >
                            <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                <DropdownList
                                    triggerElement={({isOpen, toggle}) => (
                                        <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                            <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitle)}>
                                                Assign new hardware
                                            </div>
                                        </button>
                                    )}
                                    choicesList={() => (
                                        <ul className={s(dropdownStyles.dropdownList, styles.dropdownList)}>
                                            {hardwareDropdown.map(i => (
                                                <li
                                                    className={dropdownStyles.dropdownListItem}
                                                    key={i.name}
                                                    onClick={() => handleAddHardware(i.id)}
                                                >
                                                    <button className={dropdownStyles.dropdownListItemButton}>
                                                        <div className={dropdownStyles.dropdownItemLabel}>{i.name}</div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                />
                                <div />
                            </div>
                        </Button>
                    )}

                    <DetailPageTable headers={softwareHeaders} rows={softwareRows} setRows={setSoftwareRows} />
                    {isAdmin && softwareDropdown && (
                        <Button
                            className={s(styles.addContainer, styles.dropdown2)}
                            icon='add'
                            onClick={() => {}}
                            textInside={false}
                        >
                            <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                <DropdownList
                                    triggerElement={({isOpen, toggle}) => (
                                        <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                            <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitle)}>
                                                Assign new software
                                            </div>
                                        </button>
                                    )}
                                    choicesList={() => (
                                        <ul className={dropdownStyles.dropdownList}>
                                            {softwareDropdown.map(i => (
                                                <li
                                                    className={dropdownStyles.dropdownListItem}
                                                    key={i.name}
                                                    onClick={() => handleAddSoftware(i.id)}
                                                >
                                                    <button className={dropdownStyles.dropdownListItemButton}>
                                                        <div className={dropdownStyles.dropdownItemLabel}>{i.name}</div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                />
                                <div />
                            </div>
                        </Button>
                    )}

                    <DetailPageTable headers={licenseHeaders} rows={licenseRows} setRows={setLicenseRows} />
                    {isAdmin && licenseDropdown && (
                        <Button
                            className={s(styles.addContainer, styles.dropdown1)}
                            icon='add'
                            onClick={() => {}}
                            textInside={false}
                        >
                            <div className={s(dropdownStyles.dropdownContainer, styles.dropdownContainer)}>
                                <DropdownList
                                    triggerElement={({isOpen, toggle}) => (
                                        <button onClick={toggle} className={dropdownStyles.dropdownButton}>
                                            <div className={s(dropdownStyles.dropdownTitle, styles.dropdownTitle)}>
                                                Assign new license
                                            </div>
                                        </button>
                                    )}
                                    choicesList={() => (
                                        <ul className={dropdownStyles.dropdownList}>
                                            {licenseDropdown.map(i => (
                                                <li
                                                    className={dropdownStyles.dropdownListItem}
                                                    key={i.name}
                                                    onClick={() => handleAddLicense(i.id)}
                                                >
                                                    <button className={dropdownStyles.dropdownListItemButton}>
                                                        <div className={dropdownStyles.dropdownItemLabel}>{i.name}</div>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                />
                                <div />
                            </div>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
