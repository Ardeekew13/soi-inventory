import { Product } from "@/generated/graphql";

export const responsiveColumn24 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 24,
	xl: 24,
};

export const responsiveColumn18 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 18,
	xl: 18,
};

export const responsiveColumn12 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 12,
	xl: 12,
};

export const responsiveColumn8 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 12,
	xl: 8,
};

export const responsiveColumn6 = {
	xs: 24,
	sm: 24,
	md: 24,
	lg: 12,
	xl: 6,
};

export const responsiveColumn4 = {
	xs: 24,
	sm: 12,
	md: 8,
	lg: 6,
	xl: 4,
};

export const responsiveColumn3 = {
	xs: 24,
	sm: 12,
	md: 8,
	lg: 6,
	xl: 3,
};

export const requiredField = [
	{
		required: true,
		message: "This field is required!",
	},
];

export interface CartProduct extends Product {
	quantity: number;
	quantityUsed?: number;
}
