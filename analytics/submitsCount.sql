select count(*) as number_of_submits, TO_CHAR(date_trunc('month', submitted_at), 'YYYY MON') as month, c.name as "customerName"
from blueprints_group_submit
         left join user_customer uc on blueprints_group_submit.submitted_by_user_customer_id = uc.id
         left join customer c on uc.customer_id = c.id
group by date_trunc('month', submitted_at), c.name
order by month desc, number_of_submits desc
