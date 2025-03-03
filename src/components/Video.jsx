// src/components/Video.jsx
import PropTypes from "prop-types";

/**
 * Video
 *
 * Renders a video player. You can pass either:
 *   1) a "src" prop (for a direct video file like .mp4), or
 *   2) a "youtubeId" prop for an embedded YouTube video.
 *
 * Additional optional props: "autoPlay", "controls", "loop", "muted", "poster"
 *
 * If "youtubeId" is present, we’ll render an <iframe> for YouTube.
 * Otherwise, we’ll render a native <video> tag.
 */
export default function Video({
  src,
  youtubeId,
  autoPlay = false,
  controls = true,
  loop = false,
  muted = false,
  poster,
  width = 560,
  height = 315,
  ...rest
}) {
  // 1) If we have a YouTube ID, render an iframe
  if (youtubeId) {
    const youTubeSrc = `https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&loop=${loop ? 1 : 0}`;
    return (
      <iframe
        width={width}
        height={height}
        src={youTubeSrc}
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        {...rest}
      />
    );
  }

  // 2) Otherwise, render a <video> element for a direct file
  return (
    <video
      width={width}
      height={height}
      src={src}
      autoPlay={autoPlay}
      controls={controls}
      loop={loop}
      muted={muted}
      poster={poster}
      {...rest}
    />
  );
}

Video.propTypes = {
  src: PropTypes.string,
  youtubeId: PropTypes.string,
  autoPlay: PropTypes.bool,
  controls: PropTypes.bool,
  loop: PropTypes.bool,
  muted: PropTypes.bool,
  poster: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Video.defaultProps = {
  autoPlay: false,
  controls: true,
  loop: false,
  muted: false,
  width: 560,
  height: 315,
};