/**
 * Mirrors backend CompanyStatus.companyStatusColorMapper
 */
export const COMPANY_STATUS_COLORS = {
	PENDING: "#ffc107",
	REVISION: "#ffeb3b",
	VERIFIED: "#4caf50",
	DENIED: "#f44336",
	ARCHIVED: "#482880",
	DELETED: "#aa2e25",
	UPDATED: "#3f50b5",
	PUBLISHED: "#8561c5",
	SUBMIT: "#d7e360",
	REQUIRE_PAYMENT: "#ff9800",
	SUBSCRIPTION_EXPIRED: "#795548",
};

const FALLBACK_COLOR = "#9e9e9e";

function getContrastTextColor(hex) {
	const normalized = hex.replace("#", "");
	const r = parseInt(normalized.slice(0, 2), 16);
	const g = parseInt(normalized.slice(2, 4), 16);
	const b = parseInt(normalized.slice(4, 6), 16);
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

	return luminance > 0.65 ? "#1a1a1a" : "#ffffff";
}

export function getCompanyStatusBadgeStyle(companyStatus) {
	const backgroundColor =
		COMPANY_STATUS_COLORS[companyStatus] || FALLBACK_COLOR;

	return {
		backgroundColor,
		color: getContrastTextColor(backgroundColor),
	};
}
