SELECT
  account_tb.email,
  account_tb.nickname,
  account_tb.profile,
  account_tb.provider,
  account_tb.created_at,
  account_tb.deleted_at,
  account_tb.idx,
  account_tb.serial_number,
  p.img_path,
  account_tb.interest_1,
  account_tb.interest_2
FROM
  (
    account_tb
    LEFT JOIN profile_img_tb p ON (((account_tb.idx) :: text = (p.account_idx) :: text))
  );