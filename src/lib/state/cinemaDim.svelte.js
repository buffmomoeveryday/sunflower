let cinemaDimmed = $state(false);

export function getCinemaDimmed() {
	return cinemaDimmed;
}

export function setCinemaDimmed(value) {
	cinemaDimmed = !!value;
}
