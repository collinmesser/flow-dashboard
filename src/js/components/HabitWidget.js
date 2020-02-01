var React = require('react');
import { IconButton, IconMenu, MenuItem, Dialog,
  RaisedButton, TextField, FontIcon, FlatButton,
  Toggle } from 'material-ui';
var util = require('utils/util');
var api = require('utils/api');
import {clone, pick, merge, get} from 'lodash';
import {Link} from 'react-router'
import {cyanA400} from 'material-ui/styles/colors';
var AppConstants = require('constants/AppConstants')
import {changeHandler} from 'utils/component-utils';
var HabitAnalysis = require('components/HabitAnalysis');
var ProgressLine = require('components/common/ProgressLine');
import PropTypes from 'prop-types';
import { SwatchesPicker } from 'react-color';

@changeHandler
export default class HabitWidget extends React.Component {

  static propTypes = {
    days: PropTypes.number,
    commitments: PropTypes.bool,
    user: PropTypes.object
  }

  static defaultProps = {
    days: 7,
    commitments: true
  }

  constructor(props) {
      super(props);
      this.state = {
          habits: [],
          habitdays: {},
          habit_week_start: null,
          editor_open: false,
          habit_analysis: null,
          form: {},
          working: false,
          on_mobile: util.user_agent_mobile(),
          cancellable_habitday: null
      };
      this.MOBILE_SHOW_DAYS = 3
      this.SHOW_MATERIAL_ICONS = ['check_circle', 'group_work', 'add', 'directions_run',
                                  'spa', 'lightbulb_outline', 'access_alarm', 'fitness_center',
                                  'lock', 'stars', 'visibility', 'play_circle_filled',
                                  'brightness_low', 'monetization_on']
      this.CANCELLABLE_INTERVAL_ID = null
  }

  componentDidMount() {
    this.fetch_current();
  }

  count_habits() {
    return this.state.habits.length;
  }

  save_habit() {
    let {form} = this.state;
    let params = pick(form, ['id', 'name', 'description', 'tgt_weekly', 'tgt_daily', 'icon', 'color']);
    this.setState({working: true}, () => {
      api.post("/api/habit", params, (res) => {
        if (res.habit) {
          let habits = this.state.habits;
          util.updateByKey(res.habit, habits, 'id');
          this.setState({
            habits: habits,
            form: {},
            editor_open: false,
            working: false,
            habit_analysis: null
          });
        }
      }, (res_err) => {
        this.setState({working: false});
      });
    });
  }

  fetch_current() {
    api.get("/api/habit/recent", {days: this.props.days}, (res) => {
      // dict of ids to habit days (if present)
      this.setState({habits: res.habits, habitdays: res.habitdays, habit_week_start: this.get_habit_week_start()});
    });
  }

  update_habitday_in_state(hd) {
    let {habitdays} = this.state;
    habitdays[hd.id] = hd;
    this.setState({habitdays})
  }

  day_action(habit, iso_day, action, _params) {
    let hd_id = this.make_id(habit.id, iso_day)
    let params = {
      habitday_id: hd_id,
      habit_id: habit.id,
      date: iso_day
    }
    if (_params) merge(params, _params)
    api.post(`/api/habit/${action}`, params, (res) => {
      if (res.habitday) {
        this.update_habitday_in_state(res.habitday, );
      }
    });
    return hd_id
  }

  clear_cancellable() {
    if (this.CANCELLABLE_INTERVAL_ID) window.clearTimeout(this.CANCELLABLE_INTERVAL_ID)
    this.setState({cancellable_habitday: null})
  }

  increment_day(habit, iso_day, opts) {
    util.play_audio('complete.mp3');
    let _params
    let cancelling = opts && opts.cancel
    if (cancelling) _params = {cancel: 1}
    let hd_id = this.day_action(habit, iso_day, 'increment', _params);
    if (!cancelling) {
      // Set this day as cancellable, and schedule reset for 3s from now
      this.setState({cancellable_habitday: hd_id})
      this.CANCELLABLE_INTERVAL_ID = window.setTimeout(() => {
        this.clear_cancellable()
      }, 3000)
    } else this.clear_cancellable()
  }

  toggle_day(habit, iso_day) {
    util.play_audio('complete.mp3');
    this.day_action(habit, iso_day, 'toggle');
  }

  commit(habit, iso_day) {
    util.play_audio('commit.mp3');
    this.day_action(habit, iso_day, 'commit');
  }

  make_id(habit_id, iso_day) {
    let id = "habit:"+habit_id+"_day:"+iso_day;
    return id;
  }

  show_analysis(h) {
    this.setState({habit_analysis: h});
  }

  get_habit_week_start() {
    let {user} = this.props
    let week_start_int = user ? get(user, ['settings', 'weekday_start'], AppConstants.DEFAULT_WEEK_START) : 0
    let today = new Date();
    let since_start = today.getDay() - week_start_int
    if (since_start < 0) since_start += 7;
    today.setDate(today.getDate() - since_start);
    let latest_start = today;
    return latest_start;
  }

  day_in_current_habit_week(date) {
    let {habit_week_start} = this.state;
    return date >= habit_week_start;
  }

  show_days() {
    let {on_mobile} = this.state
    return on_mobile ? this.MOBILE_SHOW_DAYS : 7
  }

  render_commitment_message() {
    let {commitments} = this.props;
    let {habits, habitdays} = this.state;
    let today_iso = util.printDateObj(new Date());
    let n_undone_commits = 0;
    habits.forEach((h) => {
      let id = this.make_id(h.id, today_iso);
      let hd = habitdays[id];
      let committed = hd && hd.committed && !hd.done;
      if (committed) n_undone_commits += 1;
    });
    if (n_undone_commits > 0) return <p className="lead" style={{color: AppConstants.COMMIT_COLOR}}>You have <b>{n_undone_commits}</b> unfinished commitment(s) today!</p>
    else return <p className="lead gray">No unfinished commitments for today. You can add new commitments using the <i className="glyphicon glyphicon-forward"></i> icon.</p>;
  }

  render_day_headers() {
    let {commitments} = this.props;
    let cursor = new Date();
    let today = new Date();
    let res = [];
    cursor.setDate(cursor.getDate() - this.show_days() + 1);
    while (cursor <= today) {
      let d = util.printDate(cursor.getTime(), "dd Do");
      let in_week = this.day_in_current_habit_week(cursor);
      let cls = in_week ? "current-habit-week" : "";
      res.push(<th key={d} className={cls}>{d}</th>);
      cursor.setDate(cursor.getDate() + 1);
    }
    if (commitments) res.push(<th key="cmt" className="current-habit-week">Commit</th>);
    res.push(<th key="tgt" className="current-habit-week">Target</th>); // progress header
    return res;
  }

  name_sort(h1, h2) {
    if (h1.name > h2.name) return 1
    else if (h1.name < h2.name) return -1
    else return 0
  }

  generate_habit_table() {
    let {habits} = this.state;
    let habit_rows = [];
    let target = 0, done = 0, committed = 0, committed_done = 0;
    habits.sort(this.name_sort.bind(this)).forEach((h) => {
      let {row, n_done, n_committed, n_committed_done, n_target} = this.render_habit(h);
      target += n_target;
      done += n_done;
      committed += n_committed;
      committed_done += n_committed_done;
      habit_rows.push(row);
    })
    let _table = (
        <table width="100%">
          <thead>
          <tr>
            <th></th>
            { this.render_day_headers() }
          </tr>
          </thead>
          <tbody>
            { habit_rows }
          </tbody>
        </table>
      );
    return {
      table: _table,
      target: target,
      done: done,
      committed: committed,
      committed_done: committed_done
    }
  }

  render_target_progress(h, done_in_week) {
    if (h.tgt_weekly) {
      let target_reached = done_in_week >= h.tgt_weekly;
      let target_near = h.tgt_weekly - done_in_week == 1;
      let _icon;
      let cls = "";
      if (target_reached) {
        cls = "target-reached";
        _icon = <i className="glyphicon glyphicon-ok-circle"></i>
      }
      if (target_near) {
        cls = "target-near";
        _icon = <i className="glyphicon glyphicon-flash" title="One more!"></i>
      }
      return <span className={"target " + cls}>{done_in_week} / {h.tgt_weekly} { _icon }</span>
    }
  }

  render_habit(h) {
    let {commitments, days} = this.props;
    let {habitdays, cancellable_habitday} = this.state;
    let cursor = new Date()
    let today = new Date()
    let yest = new Date()
    yest.setDate(yest.getDate() - 1)
    let today_iso = util.iso_from_date(today)
    let yest_iso = util.iso_from_date(yest)
    let res = [];
    var done = false, is_committed = false;
    let n_committed = 0, n_committed_done = 0, col_num = 1;
    let today_col = false
    let done_in_week = 0
    let hd
    cursor.setDate(cursor.getDate() - days + 1);
    while (!today_col) {
      let iso_day = util.iso_from_date(cursor);
      today_col = iso_day == today_iso;
      let yest_col = iso_day == yest_iso
      let id = this.make_id(h.id, iso_day);
      let in_week = this.day_in_current_habit_week(cursor);
      let count = 0
      if (habitdays[id]) {
        hd = habitdays[id];
        done = hd.done;
        if (hd.count) count = hd.count
        is_committed = hd.committed;
      } else {
        done = false;
        is_committed = false;
      }
      let countable = (today_col || yest_col) && h.tgt_daily
      if (in_week) {
        if (done) {
          done_in_week += 1;
          if (is_committed) n_committed_done += 1;
        }
        if (is_committed) n_committed += 1;
      }
      let st = {};
      if (done) st.color = h.color || cyanA400;
      else if (is_committed) st.color = AppConstants.COMMIT_COLOR;
      if (!in_week) st.opacity = 0.6;
      if (days - col_num < this.show_days()) {
        let tt = done ? "Mark Not Done" : "Mark Done";
        let icon = 'check'
        if (done) icon = h.icon || 'check_circle';
        let cancel = hd && hd.id == cancellable_habitday
        let handle_click
        if (countable) {
          if (!cancel) icon = 'exposure_plus_1'
          else {
            icon = 'undo'
            st.color = '#FC0035'
          }
          tt = cancel ? "Undo completion" : `${count} completion(s)`
          let opts = {cancel: cancel}
          handle_click = this.increment_day.bind(this, h, iso_day, opts)
        } else {
          handle_click = this.toggle_day.bind(this, h, iso_day)
        }
        res.push(<td key={iso_day}>
          <IconButton iconClassName="material-icons"
              onClick={handle_click}
              tooltip={tt}
              iconStyle={st}>{icon}
          </IconButton></td>);
      }
      cursor.setDate(cursor.getDate() + 1);
      col_num += 1
    }
    let st = {color: h.color || "#FFFFFF" };
    let _progress = this.render_target_progress(h, done_in_week)
    let _commitment;
    if (commitments) _commitment = (
        <td className="text-center">
          { (!done && !is_committed) ?
          <IconButton iconClassName="material-icons"
            onClick={this.commit.bind(this, h, today_iso)}
            tooltip="Commit"
            iconStyle={{color: AppConstants.COMMIT_COLOR}}>fast_forward
          </IconButton>
          : null }
        </td>
    )
    let row = (
      <tr key={h.id}>
        <td className="text-center">
          <a href="javascript:void(0)" onClick={this.show_analysis.bind(this, h)}><span className="show_hover"><FontIcon className="material-icons" style={{fontSize: 17, lineHeight: '17px'}}>show_chart</FontIcon></span> <b style={st} title={h.description || null}>{ h.name }</b></a>
        </td>
        {res}
        { _commitment }
        <td className="text-center">
          { _progress }
        </td>
      </tr>
      );
    let n_target = h.tgt_weekly;
    let n_done = done_in_week;
    return { row, n_target, n_done, n_committed, n_committed_done };
  }

  select_habit_color(color) {
    let {form} = this.state;
    form.color = color.hex;
    this.setState({form});
  }

  set_new_habit_icon(ic) {
    let {form} = this.state;
    form.icon = ic;
    this.setState({form});
  }

  start_editing(h) {
    this.setState({editor_open: true, form: clone(h)})
  }

  dismiss_editor() {
    this.setState({editor_open: false})
  }

  show_creator() {
    this.setState({editor_open: true, form: {}});
  }


  handle_daily_toggle() {
    let {form} = this.state
    let daily_enabled = form.tgt_daily > 0
    form.tgt_daily = daily_enabled ? 0 : 2
    this.setState({form})
  }

  render_icon_chooser() {
    return this.SHOW_MATERIAL_ICONS.map((ic) => {
      return <IconButton iconClassName="material-icons"
                         key={ic}
                         onClick={this.set_new_habit_icon.bind(this, ic)}>{ic}</IconButton>
    })
  }

  render() {
    let {habits, habitdays, editor_open, form, habit_analysis, working} = this.state;
    let no_habits = habits.length == 0;
    let _commit_bar, _progress_bar, table;
    let target = 0, done = 0, committed = 0, committed_done = 0;
    let actions = [
      <RaisedButton primary={true} label="Save Habit" onClick={this.save_habit.bind(this)} disabled={working} />,
      <FlatButton label="Cancel" onClick={this.dismiss_editor.bind(this)} />
    ]
    if (!no_habits) {
      ({table, target, done, committed, committed_done} = this.generate_habit_table());
      let target_tooltip = `${util.printPercent(done/target, {default: '0%'})} of weekly target`;
      let commit_tooltip = `${util.printPercent(committed_done/committed, {default: '0%'})} of week's commitments completed`;
      _commit_bar = <ProgressLine value={committed_done}
                              total={committed}
                              style={{marginTop: '11px'}}
                              color={AppConstants.COMMIT_COLOR}
                              tooltip={commit_tooltip} />
      _progress_bar = <ProgressLine value={done}
                              total={target}
                              style={{marginTop: '11px'}}
                              color="#FC3D6F"
                              tooltip={target_tooltip} />
    }
    let menu_actions = [
      <MenuItem key="gr" primaryText="Refresh" onClick={this.fetch_current.bind(this)} leftIcon={<FontIcon className="material-icons">refresh</FontIcon>} />
    ]
    if (this.count_habits() < AppConstants.HABIT_ACTIVE_LIMIT) menu_actions.push(<MenuItem key="new" primaryText="New Habit" onClick={this.show_creator.bind(this)} leftIcon={<FontIcon className="material-icons">add</FontIcon>} />)
    menu_actions.push(<Link key="list" to="/app/habit/history"><MenuItem primaryText="All Habits" leftIcon={<FontIcon className="material-icons">list</FontIcon>} /></Link>)
    return (
      <div className="HabitWidget" id="HabitWidget">
        <div className="row">
          <div className="col-sm-6">
            <h3>Habits</h3>
          </div>
          <div className="col-sm-6">
            <div className="pull-right">
              <IconMenu className="pull-right" iconButtonElement={<IconButton iconClassName="material-icons">more_vert</IconButton>}>
                { menu_actions }
              </IconMenu>
            </div>
          </div>
        </div>

        <HabitAnalysis days={60}
          habit={habit_analysis}
          onDismiss={this.show_analysis.bind(this, null)}
          onEdit={this.start_editing.bind(this)} />

        <Dialog
            open={editor_open}
            title={form.id == null ? "Create Habit" : "Edit Habit"}
            autoDetectWindowHeight={true} autoScrollBodyContent={true}
            onRequestClose={this.dismiss_editor.bind(this)}
            actions={actions}>

            <div className="row">
              <div className="col-sm-6">

                <TextField floatingLabelText="Habit name"
                           name="name"
                           value={form.name || ''}
                           onChange={this.changeHandler.bind(this, 'form', 'name')}
                           fullWidth autoFocus />
              </div>
              <div className="col-sm-6">
                <TextField floatingLabelText="Weekly Target (# of days complete per week)"
                           name="target"
                           value={form.tgt_weekly || ''}
                           onChange={this.changeHandler.bind(this, 'form', 'tgt_weekly')}
                           type="number"
                           minValue={0}
                           maxValue={7}
                           fullWidth />
              </div>
            </div>

            <TextField placeholder="Description"
                       name="description"
                       value={form.description || ''}
                       onChange={this.changeHandler.bind(this, 'form', 'description')}
                       fullWidth />

            <div className="row">
              <div className="col-sm-6">
                <label>Choose Color</label>
                <SwatchesPicker width={320} height={300} display={true} color={form.color || "#2D6CFA"} onChangeComplete={this.select_habit_color.bind(this)} />
              </div>
              <div className="col-sm-6">
                <label>Habit Icon</label>
                <p className="help-block">Choose an icon below, or enter any icon ID from https://material.io/icons/.</p>
                <TextField placeholder="Habit icon ID"
                           name="icon"
                           value={form.icon || ''}
                           onChange={this.changeHandler.bind(this, 'form', 'icon')}
                           fullWidth />
                { this.render_icon_chooser() }

                <label>Countable Habits</label>

                <p>To track multiple completions of a habit each day, you can enable counting by setting a daily target. When the daily target is reached, the habit will be marked as done.
                Note that the weekly target is still counted out of 7 (count 1 for each daily target reached).</p>

                <Toggle label="Show counter towards daily target" toggled={form.tgt_daily > 0} onToggle={this.handle_daily_toggle.bind(this)} />

                <div hidden={!form.tgt_daily || form.tgt_daily == 0}>
                  <TextField floatingLabelText="Daily Target (# of completions)"
                         name="tgt_daily"
                         value={form.tgt_daily || ''}
                         onChange={this.changeHandler.bind(this, 'form', 'tgt_daily')}
                         type="number"
                         fullWidth />
                </div>

              </div>
            </div>

        </Dialog>

        <div hidden={!no_habits}>
          <div className="text-center empty">None yet, <a href="javascript:void(0)" onClick={this.show_creator.bind(this)}>create</a> your first habit!</div>
        </div>

        <div hidden={no_habits}>
          { this.render_commitment_message() }
        </div>

        { _commit_bar }

        { table }

        { _progress_bar }

      </div>
    )
  }
}
