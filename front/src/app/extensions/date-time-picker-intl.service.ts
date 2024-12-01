/**
 * date-time-picker-intl.service
 */

import {Injectable} from '@angular/core';
import {OwlDateTimeIntl} from "@danielmoncada/angular-datetime-picker";

@Injectable()
export class RuOwlDateTimeIntl extends OwlDateTimeIntl {
  /** A label for the up second button (used by screen readers).  */
  override upSecondLabel = 'Добавить секунду';

  /** A label for the down second button (used by screen readers).  */
  override downSecondLabel = 'Вычесть секунду';

  /** A label for the up minute button (used by screen readers).  */
  override upMinuteLabel = 'Добавить минуту';

  /** A label for the down minute button (used by screen readers).  */
  override downMinuteLabel = 'Вычесть минуту';

  /** A label for the up hour button (used by screen readers).  */
  override upHourLabel = 'Добавить час';

  /** A label for the down hour button (used by screen readers).  */
  override downHourLabel = 'Вычесть час';

  /** A label for the previous month button (used by screen readers). */
  override prevMonthLabel = 'Предыдущий месяц';

  /** A label for the next month button (used by screen readers). */
  override nextMonthLabel = 'Следующий месяц';

  /** A label for the previous year button (used by screen readers). */
  override prevYearLabel = 'Предыдущий год';

  /** A label for the next year button (used by screen readers). */
  override nextYearLabel = 'Следующий год';

  /** A label for the previous multi-year button (used by screen readers). */
  override prevMultiYearLabel = 'Предыдущие 21 год';

  /** A label for the next multi-year button (used by screen readers). */
  override nextMultiYearLabel = 'Следующие 21 год';

  /** A label for the 'switch to month view' button (used by screen readers). */
  override switchToMonthViewLabel = 'Показать месяцы';

  /** A label for the 'switch to year view' button (used by screen readers). */
  override switchToMultiYearViewLabel = 'Выбрать месяц и год';

  /** A label for the cancel button */
  override cancelBtnLabel = 'Отмена';

  /** A label for the set button */
  override setBtnLabel = 'Выбрать';

  /** A label for the range 'from' in picker info */
  override rangeFromLabel = 'От';

  /** A label for the range 'to' in picker info */
  override rangeToLabel = 'До';

  /** A label for the hour12 button (AM) */
  override hour12AMLabel = 'AM';

  /** A label for the hour12 button (PM) */
  override hour12PMLabel = 'PM';
}
