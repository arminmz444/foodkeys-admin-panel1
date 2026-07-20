import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button,
	Grid,
	Typography,
} from "@mui/material";

const LOCATION_FIELDS = [
	{ key: "country", label: "کشور" },
	{ key: "industrialCity", label: "شهر صنعتی" },
	{ key: "officeLocation", label: "موقعیت دفتر" },
	{ key: "officeState", label: "استان دفتر" },
	{ key: "officeCity", label: "شهر دفتر" },
	{ key: "officePoBox", label: "صندوق پستی دفتر" },
	{ key: "factoryLocation", label: "موقعیت کارخانه" },
	{ key: "factoryState", label: "استان کارخانه" },
	{ key: "factoryCity", label: "شهر کارخانه" },
	{ key: "factoryPoBox", label: "صندوق پستی کارخانه" },
	{ key: "fullAddress", label: "آدرس کامل", fullWidth: true },
];

function formatCoordinates(location) {
	if (location?.longitude == null || location?.latitude == null) {
		return null;
	}

	return `طول جغرافیایی: ${location.longitude}، عرض جغرافیایی: ${location.latitude}`;
}

function CompanyLocationModal({ open, onClose, companyName, location }) {
	const coordinates = formatCoordinates(location);

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle>
				{companyName ? `موقعیت مکانی — ${companyName}` : "موقعیت مکانی"}
			</DialogTitle>
			<DialogContent dividers>
				<Grid container spacing={2}>
					{LOCATION_FIELDS.map(({ key, label, fullWidth }) => (
						<Grid item xs={12} sm={fullWidth ? 12 : 6} key={key}>
							<Typography variant="subtitle2" color="text.secondary">
								{label}
							</Typography>
							<Typography>{location?.[key] || "-"}</Typography>
						</Grid>
					))}
					{coordinates && (
						<Grid item xs={12}>
							<Typography variant="subtitle2" color="text.secondary">
								مختصات جغرافیایی
							</Typography>
							<Typography>{coordinates}</Typography>
						</Grid>
					)}
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>بستن</Button>
			</DialogActions>
		</Dialog>
	);
}

export function hasCompanyLocationData(location) {
	if (!location || typeof location !== "object") {
		return false;
	}

	return LOCATION_FIELDS.some(({ key }) => {
		const value = location[key];
		return value != null && String(value).trim() !== "";
	});
}

export default CompanyLocationModal;
