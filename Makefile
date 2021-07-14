deploy:
	mbt build
	cf deploy mta_archives/seniority-calc_1.0.0.mtar