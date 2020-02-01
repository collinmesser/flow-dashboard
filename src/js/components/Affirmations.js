var React = require('react');
import { RaisedButton, FlatButton } from 'material-ui';
import { Link } from 'react-router';
var AppConstants = require('constants/AppConstants');
var util = require('utils/util');

export default class About extends React.Component {
    static defaultProps = {}
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        util.set_title("Affirmations");
    }

    render() {
        let { user } = this.props;
        let _feedback;
        if (user) _feedback = (
            <div>
                <h3>This is my personal flow dashboard.</h3>

                <p>I don't offer support for it, but if you, you can get in touch via Github, or email collinmesser (gmail).</p>
            </div>
        )
        return (
            <div>
                <div className="text-center">
                    <h2 style={{ marginTop: "40px", marginBottom: "60px" }}>Affirmations v.17 - Last Edit: 2/1/20</h2>
                    <p className="lead" style={{ fontSize: "1.45em" }}>{AppConstants.TAGLINE}</p>

                    <div className="row text-left">
                        <ul>
                            <li className="lead" style={{ fontSize: "1.45em" }}>I am gentle and understanding with Ellie and Silas.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I am lovingly supporting Alli to help her achieve her dreams and thrive every day.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I am excited to connect with people about Permanent Equity and they'll be excited too.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I am building a thriving blog that brings people joy and usefullness.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I am a compelling public speaker that crushes presentations and gets paid to do it.</li>
                        </ul>
                    </div>
                </div>
                <div className="text-center">
                    <h2 style={{ marginTop: "40px", marginBottom: "60px" }}>Quotes to Live By</h2>
                    <p className="lead" style={{ fontSize: "1.45em" }}>These quotes are themes that I'm trying to instill in my life consistently.</p>

                    <div className="row text-left">
                        <ul>
                            <li className="lead" style={{ fontSize: "1.45em" }}>What’s the ONE THING I can do such that by doing it everything else will be easier or unnecessary?</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>Regret is a whole lot longer and more painful than any instant rejection of going for the entrepreneur goal</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>You only have one life and it'll be over before you know it. Memento Mori - Remember your mortality</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>Done is better than perfect</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>Discipline is just choosing between what you want now and what you want most. Discipline is freedom.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>I can only teach my kids what I live myself.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>The thoughts you keep in a loop determind the direction of your life.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>“Summing it all up, friends, I’d say you’ll do best by filling your minds and meditating on things true, noble, reputable, authentic, compelling, gracious—the best, not the worst; the beautiful, not the ugly; things to praise, not things to curse. Put into practice what you learned from me, what you heard and saw and realized. Do that, and God, who makes everything work together, will work you into his most excellent harmonies.”
‭‭                            - Philippians‬ ‭4:8-9</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>All your ideas may be solid or even good .. But you have to Actually EXECUTE on them for them to matter.</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>Love your family, work super hard, live your passion. - Gary V</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>You need to spend all of your time and energy on creating something that actually brings value to the people you’re asking for money! - Gary V</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>"Someday" is a disease that will take your dreams to grave with you. - Tim Ferris</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>Whether you’re 9 or 90, stop trying to fix the things you’re bad at, and focus on the things you’re good at. - Gary V</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>Earn with your mind, not your time. Naval Ravikant</li>

                            <li className="lead" style={{ fontSize: "1.45em" }}>If you do what you've always done, you'll get what you've always gotten. - Tony Robbins</li>
                        </ul>
                    </div>
                </div>

            </div>
        );
    }
}
