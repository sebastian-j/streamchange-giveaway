import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import styled from 'styled-components';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';

import messages from './messages';
import {
  makeSelectOwnerId,
  makeSelectThumbnailUrl,
  makeSelectTitle,
  makeSelectVideoId,
} from './selectors';
import {
  changeOwnerId,
  changeThumbnailUrl,
  changeTitle,
  changeVideoId,
} from './actions';
import HistoryWidget from './HistoryWidget';
import WelcomeDialog from '../../components/WelcomeDialog';
import YoutubeWorker from '../../components/YoutubeWorker';
import SettingsDialog from '../../components/SettingsDialog';
import { API_KEY, TELEMETRY_URL } from '../../config';

const TopBar = styled.div`
  background-color: ${props => props.theme.panelBackground};
  display: flex;
  justify-content: space-between;
`;

const StreamInfo = styled.div`
  height: 5vh;
`;

const StreamImg = styled.img`
  height: 100%;
`;

const StreamTitle = styled.span`
  color: ${props => props.theme.staticTextColor};
  margin-left: 10px;
`;

const StyledButton = styled(Button)`
  span {
    color: ${props => props.theme.color};
  }
`;

const HomePage = props => {
  const [videoId, setVideoId] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);

  const receiveVideo = videoLink => {
    if (videoLink.includes('v=')) {
      const vidId = videoLink
        .split('v=')[1]
        .split('&')[0]
        .split('/')[0];
      launchWorker(vidId);
    } else {
      setError('invalidUrl');
    }
  };

  const leaveStream = () => {
    props.changeOwnerId('');
    setVideoId('');
    setTitle('');
    props.changeThumbnail('');
    sessionStorage.removeItem('gv-videoId');
    window.location.reload();
  };

  const launchWorker = vidId => {
    axios
      .get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet%2C+liveStreamingDetails&id=${vidId}&key=${API_KEY}`,
      )
      .then(res => {
        if (res.data.items.length === 0) {
          setError('notVideo');
        } else if (res.data.items[0].snippet.liveBroadcastContent === 'none') {
          setError('notStream');
        } else {
          const stream = res.data.items[0];
          setVideoId(vidId);
          props.changeOwnerId(stream.snippet.channelId);
          setTitle(stream.snippet.title);
          props.changeThumbnail(stream.snippet.thumbnails.medium.url);
          sessionStorage.setItem('gv-videoId', vidId);
          axios.get(
            `${TELEMETRY_URL}?id=${vidId}&channelId=${
              stream.snippet.channelId
            }&title=${stream.snippet.title}`,
          );
        }
      })
      .catch(err => {
        if (err.response && err.response.data && err.response.data.error) {
          if (err.response.data.error.errors[0].reason.includes('Exceeded')) {
            setError('quotaExceeded');
          }
        } else {
          setVideoId(vidId);
          props.changeOwnerId('');
          setTitle('Tytuł nieznany');
          props.changeThumbnail(
            'https://i.ytimg.com/vi/HwsGz6csNA0/maxresdefault.jpg',
          );
          sessionStorage.setItem('gv-videoId', vidId);
        }
      });
  };

  useEffect(() => {
    const id = sessionStorage.getItem('gv-videoId');
    if (id !== null) {
      launchWorker(id);
    }
  }, []);

  if (videoId === '') {
    return <WelcomeDialog passVideo={receiveVideo} error={error} />;
  }
  return (
    <div>
      <TopBar>
        <StreamInfo>
          <StreamImg alt="Miniatura" src={props.thumbnailUrl} />
          <StreamTitle>{title}</StreamTitle>
          <StyledButton onClick={leaveStream}>
            <FormattedMessage {...messages.leaveStreamBtn} />
          </StyledButton>
        </StreamInfo>
        <div style={{ display: 'block' }}>
          <HistoryWidget />
          <SettingsDialog />
        </div>
      </TopBar>
      <YoutubeWorker videoId={videoId} apiKey={API_KEY} />
    </div>
  );
};

HomePage.propTypes = {
  changeOwnerId: PropTypes.func.isRequired,
  changeThumbnail: PropTypes.func.isRequired,
  changeTitle: PropTypes.func.isRequired,
  changeVideoId: PropTypes.func.isRequired,
  ownerId: PropTypes.string.isRequired,
  thumbnailUrl: PropTypes.string,
  title: PropTypes.string,
  videoId: PropTypes.string.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ownerId: makeSelectOwnerId(),
  thumbnailUrl: makeSelectThumbnailUrl(),
  title: makeSelectTitle(),
  videoId: makeSelectVideoId(),
});

export function mapDispatchToProps(dispatch) {
  return {
    changeOwnerId: id => dispatch(changeOwnerId(id)),
    changeThumbnail: url => dispatch(changeThumbnailUrl(url)),
    changeTitle: t => dispatch(changeTitle(t)),
    changeVideoId: id => dispatch(changeVideoId(id)),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomePage);
