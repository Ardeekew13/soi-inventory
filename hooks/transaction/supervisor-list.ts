"use client";

import { supabase } from "@/lib/supabase-client";
import { ListItem } from "@/utils/interfaces";
import { useEffect, useState } from "react";

const UseSupervisorList = () => {
	const [list, setList] = useState<ListItem[]>([]);

	useEffect(() => {
		const fetchSupervisors = async () => {
			const { data, error } = await supabase.rpc("get_supervisor_list");

			if (error) {
				console.error("Error fetching supervisors:", error);
				return;
			}

			if (data && data.length > 0) {
				const mapped = data.map((u: any) => ({
					id: u.id,
					label: u.name,
					value: u.id,
				}));
				setList(mapped);
			}
		};

		fetchSupervisors();
	}, []);

	return list;
};

export default UseSupervisorList;
