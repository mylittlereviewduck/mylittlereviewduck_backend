SELECT
  a.idx,
  a.email,
  a.nickname,
  a.profile,
  a.provider,
  a.created_at,
  a.deleted_at,
  a.serial_number,
  p.img_path AS profile_img,
  (count(DISTINCT f1.follower_idx)) :: integer AS follower_count,
  (count(DISTINCT f2.followee_idx)) :: integer AS followee_count,
  a.interest_1,
  a.interest_2
FROM
  (
    (
      (
        account_tb a
        LEFT JOIN profile_img_tb p ON (((a.idx) :: text = (p.account_idx) :: text))
      )
      LEFT JOIN follow_tb f1 ON (((a.idx) :: text = (f1.follower_idx) :: text))
    )
    LEFT JOIN follow_tb f2 ON (((a.idx) :: text = (f2.followee_idx) :: text))
  )
GROUP BY
  a.idx,
  a.email,
  a.nickname,
  p.img_path,
  a.interest_1,
  a.interest_2;