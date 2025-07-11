"use client";

import { useCallback, useState } from "react";

export const useModal = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState<any | undefined>(
		undefined
	);

	const openModal = useCallback((record?: any) => {
		if (record) setSelectedRecord(record);
		setIsModalOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
		setSelectedRecord(undefined);
	}, []);

	return {
		isModalOpen,
		openModal,
		closeModal,
		selectedRecord,
	};
};
