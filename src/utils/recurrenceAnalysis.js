
function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371000;

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

export function findRecurringHotspots(
  issues = [],
  radiusMeters = 500,
  minimumReports = 2
) {
  const validIssues = issues.filter(
    (issue) =>
      Number.isFinite(Number(issue.latitude)) &&
      Number.isFinite(Number(issue.longitude)) &&
      issue.latitude !== null &&
      issue.longitude !== null &&
      issue.category
  );

  const visited = new Set();
  const hotspots = [];

  validIssues.forEach((issue, index) => {
    if (visited.has(index)) return;

    const nearbyIssues = validIssues.filter((otherIssue, otherIndex) => {
      if (otherIndex === index || visited.has(otherIndex)) return false;

      if (
        otherIssue.category.toLowerCase() !==
        issue.category.toLowerCase()
      ) {
        return false;
      }

      const distance = calculateDistance(
        Number(issue.latitude),
        Number(issue.longitude),
        Number(otherIssue.latitude),
        Number(otherIssue.longitude)
      );

      return distance <= radiusMeters;
    });

    if (nearbyIssues.length + 1 >= minimumReports) {
      const group = [issue, ...nearbyIssues];

      group.forEach((item) => {
        visited.add(validIssues.indexOf(item));
      });

      hotspots.push({
        category: issue.category,
        latitude:
          group.reduce((sum, item) => sum + Number(item.latitude), 0) /
          group.length,
        longitude:
          group.reduce((sum, item) => sum + Number(item.longitude), 0) /
          group.length,
        reportCount: group.length,
        issues: group
      });
    } else {
      visited.add(index);
    }
  });

  return hotspots;
}
