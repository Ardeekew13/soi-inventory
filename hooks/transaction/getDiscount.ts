"use client";

import { supabase } from "@/lib/supabase-client";
import { useEffect, useState } from "react";

interface DiscountOption {
	id: string;
	label: string;
	value: string; // store id in value for Select
	percentage: number;
}

const useDiscountList = () => {
	const [list, setList] = useState<DiscountOption[]>([]);

	useEffect(() => {
		const fetchDiscounts = async () => {
			const { data, error } = await supabase.rpc("get_discounts");

			if (error) {
				console.error("Error fetching supervisors:", error);
				return;
			}

			if (data && data.length > 0) {
				const mapped = data.map((u: any) => ({
					id: u.id,
					label: u.description,
					value: u.id,
					percentage: u.percentage,
				}));
				setList(mapped);
			}
		};

		fetchDiscounts();
	}, []);

	return list;
};

export default useDiscountList;
