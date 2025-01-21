import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { workoutService } from "@/services/workoutService";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@mui/material/styles";
import ReactApexChart from "react-apexcharts";

const areaChartOptions = {
  chart: {
    height: 450,
    type: "area",
    toolbar: {
      show: false,
    },
    background: "transparent",
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  grid: {
    strokeDashArray: 0,
    show: true,
    borderColor: "rgba(255, 255, 255, 0.1)",
    position: "front",
  },
  xaxis: {
    type: "category",
    labels: {
      formatter: function (value) {
        return new Date(parseInt(value)).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      },
    },
    tickPlacement: "on",
    tickAmount: 8,
    axisBorder: {
      show: true,
      color: "rgba(255, 255, 255, 0.3)",
    },
    axisTicks: {
      show: true,
      color: "rgba(255, 255, 255, 0.3)",
    },
  },
  tooltip: {
    x: {
      formatter: function (value) {
        return new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
  },
  fill: {
    type: "solid",
    opacity: 0.3,
  },
  plotOptions: {
    area: {
      fillTo: "end",
    },
  },
};

export default function IncomeAreaChart({ selectedExercise }) {
  const theme = useTheme();
  const { user } = useAuth();
  const [options, setOptions] = useState(areaChartOptions);
  const [series, setSeries] = useState([]);
  const [weightPeriods, setWeightPeriods] = useState([]);

  const calculateFontSize = (startDate, endDate, totalDuration) => {
    const duration = endDate - startDate;
    const percentage = (duration / totalDuration) * 100;
    // Scale font size based on the width of the period
    if (percentage < 10) return 22;
    if (percentage < 20) return 32;
    if (percentage < 30) return 48;
    return 80;
  };

  useEffect(() => {
    const fetchExerciseData = async () => {
      if (!user || !selectedExercise) return;
      const workouts = await workoutService.getAllWorkouts(user.uid);

      const exerciseData = workouts
        .filter((workout) => workout.exercises)
        .map((workout) => {
          const exercise = workout.exercises.find(
            (ex) => ex.name === selectedExercise,
          );
          if (exercise) {
            return {
              date: workout.timestamp,
              set1: parseInt(exercise.sets[0]?.reps) || 0,
              set2: parseInt(exercise.sets[1]?.reps) || 0,
              set3: parseInt(exercise.sets[2]?.reps) || 0,
              weight: exercise.sets[0]?.weight || 0,
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => a.date - b.date);

      // Find distinct weight periods
      const periods = [];
      let currentPeriod = null;

      exerciseData.forEach((data) => {
        if (!currentPeriod || currentPeriod.weight !== data.weight) {
          if (currentPeriod) {
            currentPeriod.endDate = data.date;
          }
          currentPeriod = {
            weight: data.weight,
            startDate: data.date,
            endDate: null,
          };
          periods.push(currentPeriod);
        }
      });

      if (currentPeriod) {
        currentPeriod.endDate = exerciseData[exerciseData.length - 1].date;
      }

      setWeightPeriods(periods);

      const maxReps =
        Math.max(...exerciseData.map((d) => Math.max(d.set1, d.set2, d.set3))) +
        2;

      setSeries([
        {
          name: "Set 1",
          data: exerciseData.map((d) => ({
            x: d.date,
            y: d.set1,
          })),
        },
        {
          name: "Set 2",
          data: exerciseData.map((d) => ({
            x: d.date,
            y: d.set2,
          })),
        },
        {
          name: "Set 3",
          data: exerciseData.map((d) => ({
            x: d.date,
            y: d.set3,
          })),
        },
      ]);

      setOptions({
        ...areaChartOptions,
        yaxis: {
          min: 0,
          max: Math.ceil(maxReps / 2) * 2,
          tickAmount: Math.ceil(maxReps / 2),
          axisBorder: {
            show: true,
            color: "rgba(255, 255, 255, 0.3)",
          },
          axisTicks: {
            show: true,
            color: "rgba(255, 255, 255, 0.3)",
          },
        },
        colors: ["#90CAF9", theme.palette.primary.main, "#2E5984"],
      });
    };

    fetchExerciseData();
  }, [user, selectedExercise, theme]);

  return (
    <div className="relative h-[350px] w-full">
      <div className="absolute inset-0">
        {weightPeriods.map((period, index) => {
          const totalDuration =
            weightPeriods[weightPeriods.length - 1]?.endDate -
            weightPeriods[0]?.startDate;

          const widthPercentage =
            ((period.endDate - period.startDate) / totalDuration) * 100;

          const sizes = weightPeriods.map((p) =>
            calculateFontSize(p.startDate, p.endDate, totalDuration),
          );
          const fontSize = Math.min(...sizes);

          const hasEnoughSpace = widthPercentage > 10;

          // Find the last visible weight
          const lastVisibleIndex = weightPeriods
            .map((p, i) => ({
              width: ((p.endDate - p.startDate) / totalDuration) * 100,
              index: i,
            }))
            .filter((p) => p.width > 10)
            .pop()?.index;

          const isLastVisible = index === lastVisibleIndex;

          return (
            <div
              key={index}
              className="absolute flex items-center justify-center"
              style={{
                left: `${((period.startDate - weightPeriods[0]?.startDate) / totalDuration) * 100}%`,
                width: `${widthPercentage}%`,
                height: "100%",
              }}
            >
              {hasEnoughSpace && (
                <>
                  {!isLastVisible && (
                    <div
                      className="absolute bg-gray-300 opacity-70"
                      style={{
                        width: "1.5px",
                        right: 0,
                        top: "70px",
                        height: "calc(100% - 160px)",
                      }}
                    />
                  )}
                  <span
                    className="whitespace-nowrap font-bold text-gray-400 opacity-70"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {period.weight}kg
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={350}
        />
      </div>
    </div>
  );
}

IncomeAreaChart.propTypes = {
  selectedExercise: PropTypes.string,
};
