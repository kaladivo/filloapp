import React, {useCallback, useContext, useEffect, useState} from 'react'
import {useUser} from '../../utils/auth'
import CustomerSelect from './components/CustomerSelect'

const customerSelectorContext = React.createContext<{
	triggerSelect: () => void
}>({
	triggerSelect: () => undefined,
})

function CustomerSelectorProvider({children}: {children: React.ReactNode}) {
	const user = useUser()
	const [showSelector, setShowSelector] = useState(
		!user?.userInfo?.selectedCustomer
	)

	const triggerSelect = useCallback(() => {
		setShowSelector(true)
	}, [setShowSelector])

	useEffect(() => {
		if (!user?.userInfo.selectedCustomer) setShowSelector(true)
	}, [user, setShowSelector])

	return (
		<customerSelectorContext.Provider value={{triggerSelect}}>
			{showSelector ? (
				<CustomerSelect onSelected={() => setShowSelector(false)} />
			) : (
				children
			)}
		</customerSelectorContext.Provider>
	)
}

export default CustomerSelectorProvider

export function useCustomerSelector() {
	return useContext(customerSelectorContext)
}
