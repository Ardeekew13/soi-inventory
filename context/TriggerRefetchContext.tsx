import React, { createContext, useContext, useState } from "react";

type GlobalRefetchContextType = {
	triggerRefetch: boolean;
	setTriggerRefetch: (value: boolean) => void;
};

export const GlobalRefetchContext = createContext<GlobalRefetchContextType>({
	triggerRefetch: false,
	setTriggerRefetch: () => {},
});

export const GlobalRefetchProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [triggerRefetch, setTriggerRefetch] = useState(false);

	return (
		<GlobalRefetchContext.Provider
			value={{ triggerRefetch, setTriggerRefetch }}
		>
			{children}
		</GlobalRefetchContext.Provider>
	);
};

export const useRefetchFlag = () => {
	const context = useContext(GlobalRefetchContext);
	if (!context) {
		throw new Error("useRefetchFlag must be used within a RefetchFlagProvider");
	}
	return context;
};
